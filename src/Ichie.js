/*global ImageAreaSelection:false, CommandQueue:false, FilterCommand:false*/

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
    this.stage = null;
    this.clipboard = null;
    this.layer = null;
    this.image = null;
    this.image_selection = null;
    this.image_boundry = null;
    this.command_queue = new CommandQueue();
    this.command_queue.init();
};

Ichie.prototype = {

    /**
     * Gets this instance prepared for loading an image and kicking off the editing process.
     */
    init: function(container, options)
    {
        this.options = $.extend({}, Ichie.DEFAULT_OPTIONS, options || {});
        this.image_selection = new ImageAreaSelection();
        this.layer = new Kinetic.Layer({ id: 'image-layer' });
        this.stage = new Kinetic.Stage({
          container: container,
          width: this.options.width,
          height: this.options.height
        });

        this.stage.add(this.layer);
    },

    /**
     * Loads the given image, then displays it and initializes our ImageAreaSelection.
     */
    launch: function(image_source, ready_hook)
    {
        var that = this, image = new Image();

        image.onload = function()
        {
            that.image = that.createKineticImage(image);
            that.layer.add(that.image);
            that.layer.draw();

            var img_pos = that.image.getAbsolutePosition();
            that.image_boundry = {
                top: Math.floor(img_pos.y),
                right: Math.ceil(img_pos.x + that.image.getWidth()),
                bottom: Math.ceil(img_pos.y + that.image.getHeight()),
                left: Math.floor(img_pos.x)
            };

            that.image_selection.init(that, {
                width: that.options.width / 2,
                height: that.options.height / 2
            });

            ready_hook();
        };
        image.src = image_source;
    },

    /**
     * Creates the Kinetic.Image instance that represents are currently loaded image.
     */ 
    createKineticImage: function(image)
    {
        var width = image.naturalWidth, height = image.naturalHeight;
        return new Kinetic.Image({
            image: image,
            x: this.stage.getWidth() / 2 - (width / 2),
            y: this.stage.getHeight() / 2 - (height / 2),
            width: width,
            height: height,
            id: 'src-image'
        });
    },

    /**
     * Shows the currently image selection.
     */
    showSelection: function()
    {
        this.image_selection.show();
    },

    /**
     * Hides the currently image selection.
     */
    hideSelection: function()
    {
        this.image_selection.hide();
    },

    /**
     * Returns our Kinetic.Stage instance.
     */
    getStage: function()
    {
        return this.stage;
    },

    /**
     * Returns our Kinetic.Layer instance.
     */
    getLayer: function()
    {
        return this.layer;
    },

    /**
     * Returns our Kinetic.Image instance that represents the currently loaded/drawn image.
     */
    getImage: function()
    {
        return this.image;
    },

    getImageBoundry: function()
    {
        return this.image_boundry;
    },

    undo: function()
    {
        this.command_queue.undo();
    },

    redo: function()
    {
        this.command_queue.redo();
    },

    copyCurrentSelection: function()
    {
        var selection = this.image_selection.getSelection();
        this.clipboard = this.layer.getContext().getImageData(
            selection.left, 
            selection.top, 
            selection.right - selection.left, 
            selection.bottom - selection.top
        );
    },

    pasteClipboard: function()
    {
        if (! this.clipboard) 
        {
            return;
        }
        var selection = this.image_selection.getSelection();
        this.layer.getContext().putImageData(
            this.clipboard,
            selection.left, 
            selection.top
        );
        this.clipboard = null;
    },

    filter: function(name, options)
    {
        var command = new FilterCommand();
        command.init({
            context: this.layer.getContext('2d'),
            selection: this.image_selection.getSelection(),
            filter_name: name
        });
        this.command_queue.execute(command);
    },

    crop: function()
    {
        // @todo implement ^^
    },

    setSelectMode: function(name)
    {
        this.image_selection.resizeInteraction.setMode(name);
    }
};

/**
 * A set of default options that apply when we were not given a specific value,
 * for one of our supported options.
 * Options wihtout default values are also listed here and simple have the value null.
 */
Ichie.DEFAULT_OPTIONS = {
    width: 500,
    height: 300
};
