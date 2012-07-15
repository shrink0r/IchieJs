/*global ImageAreaSelection:false, CommandQueue:false, FilterCommand:false, CropCommand:false, PasteCommand:false, PreviewDisplay: false, MainDisplay:false*/

// -----------------------------------------------------------------------------
//                          Ichie
// Ichie is a client side image editor based on canvas and the Kinetic library.
// Besides Kinetic, undescorejs and jquery are also required.
// In most cases you are probally allready using one of those deps and the other excuse is,
// that the usage of underscorejs and jquery is pretty minimal so it might be factored at some point.
// -----------------------------------------------------------------------------

var Ichie = function()
{
    this.options = null;
    this.clipboard = null;
    this.main_display = null;
    this.preview_display = null;
    this.working_canvas = null;
    this.command_queue = null;
};

Ichie.prototype = {

    /**
     * Gets this instance prepared for loading an image and kicking off the editing process.
     */
    init: function(options)
    {
        this.options = $.extend({}, Ichie.DEFAULT_OPTIONS, options || {});
        var that = this;

        this.preview_display = new PreviewDisplay();
        this.main_display = new MainDisplay();

        this.preview_display.init({
            container: this.options.preview_container,
            onViewportChanged: that.main_display.onViewportChanged.bind(that.main_display)
        });
        
        this.main_display.init({
            container: this.options.main_container,
            width: this.options.width,
            height: this.options.height,
            onViewportChanged: this.preview_display.onViewPortChanged.bind(this.preview_display),
            onSelectionChanged: this.options.onSelectionChanged
        });

        this.working_canvas = document.createElement("canvas");

        this.command_queue = new CommandQueue();
        this.command_queue.init();
    },

    /**
     * --------------------------------------------------------------------------
     * PRIVATE METHODS - CLASS INTERNAL USAGE ONLY!
     * --------------------------------------------------------------------------
     */

    onImageProcessed: function(image)
    {
        var width = image.naturalWidth, 
            height = image.naturalHeight,
            working_ctx = this.working_canvas.getContext("2d"),
            adopt_size = (this.working_canvas.width !== width) || 
            (this.working_canvas.height !== height);

        if (adopt_size)
        {
            this.working_canvas.width = width;
            this.working_canvas.height = height;
        }
        
        working_ctx.drawImage(image, 0, 0);
        // atm, always update the preview-display first, as the main-display throws viewport events,
        // that require the preview-display to allready have the latest image set. :S
        this.preview_display.setImage(image, adopt_size); 
        this.main_display.setImage(image, adopt_size);
    },

    /**
     * --------------------------------------------------------------------------
     * PUBLIC METHODS - USE AS YOU LIKE
     * --------------------------------------------------------------------------
     */

     /**
     * Loads the given image, then displays it and initializes our ImageAreaSelection.
     */
    launch: function(image_source, ready_hook)
    {
        var that = this, image = new Image();

        image.onload = function()
        {
            that.onImageProcessed(image);
            ready_hook();
        };
        image.src = image_source;
    },

    /**
     * Shows the currently image selection.
     */
    showSelection: function()
    {
        this.main_display.showSelection();
    },

    /**
     * Hides the currently image selection.
     */
    hideSelection: function()
    {
        this.main_display.hideSelection();
    },

    /**
     * Set the resize mode to use when resizing our current selection.
     * Atm you may choose between 'default' and 'keep-ratio'.
     */
    setSelectMode: function(name)
    {
        this.main_display.setSelectMode(name);
    },

    /**
     * Copy the currently selected image are to Ichie's clipboard.
     */
    copySelection: function()
    {
        var selection = this.main_display.getCurrentSelection();
        this.clipboard = this.working_canvas.getContext('2d').getImageData(
            selection.left, 
            selection.top, 
            selection.right - selection.left, 
            selection.bottom - selection.top
        );
    },

    /**
     * Send the current state of our image to the browser,
     * so the user may download it.
     */
    downloadAsImage: function()
    {
        var data_url = this.working_canvas.toDataURL('image/png');
        data_url = data_url.replace("image/png", "image/octet-stream");
        document.location.href = data_url;
    },

    /**
     * Returns our Kinetic.Stage instance.
     */
    getStage: function()
    {
        return this.main_display.getStage();
    },

    /**
     * Returns our Kinetic.Layer instance.
     */
    getLayer: function()
    {
        return this.main_display.getLayer();
    },

    /**
     * Returns our Kinetic.Image instance.
     */
    getImage: function()
    {
        return this.main_display.getImage();
    },

    /*
     * These methods actually alter our image's state.
     * Our image's state may only be altered inside of commands,
     * which are required to implement consistent execute and revert methods.
     */

    pasteClipboard: function()
    {
        if (! this.clipboard) 
        {
            return;
        }
        var command = new PasteCommand(),
            selection = this.main_display.getCurrentSelection(),
            that = this;

        command.init(this.working_canvas, {
            data: this.clipboard,
            coords: { x: selection.left, y: selection.top },
            onexecuted: this.onImageProcessed.bind(this)
        });

        this.command_queue.execute(command);
        // @todo backup clipboard data, so we can paste the same stuff multiple times
        this.clipboard = null;
    },

    filter: function(filter_name, options)
    {
        var command = new FilterCommand(), 
            that = this;

        command.init(this.working_canvas, {
            filter: filter_name,
            bounds: this.main_display.getCurrentSelection(),
            onexecuted: this.onImageProcessed.bind(this)
        });

        this.command_queue.execute(command);
    },

    crop: function()
    {
        var command = new CropCommand(),
            that = this;

        command.init(this.working_canvas, {
            bounds: this.main_display.getCurrentSelection(),
            onexecuted: that.onImageProcessed.bind(this)
        });

        this.command_queue.execute(command);
    },

    undo: function()
    {
        this.command_queue.undo();
    },

    redo: function()
    {
        this.command_queue.redo();
    }
};

/**
 * A set of default options that apply when we were not given a specific value,
 * for one of our supported options.
 * Options wihtout default values are also listed here and simple have the value null.
 */
Ichie.DEFAULT_OPTIONS = {
    width: 500,
    height: 300,
    onSelectionChanged: function() {}
};
