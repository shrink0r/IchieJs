/*global ResizeInteraction:false, SelectionOverlay:false*/

// -----------------------------------------------------------------------------
//                          ImageAreaSelection
// Allows you to define a selection on the currently loaded image
// and together with the ResizeInterAction gives the user the possibilty
// to alter the selection by interacting through the mouse and touch interface,
// thereby providing different select modes such as centered-, symetric- or locked-ratio-selection.
// You can query an ImageAreaSelection instance for the bounds of the current selection,
// hide, show and reset the current selection.
// -----------------------------------------------------------------------------

var ImageAreaSelection = function()
{
    this.display = null;
    this.stage = null;
    this.options = null;
    this.ratio = null;
    this.shapes_group = null;
    this.layer = null;
    this.resize_handles = null;
    this.selection_rect = null;
    this.resizeInteraction = null;
    this.resize_overlay = null;
    this.drag_bounds = null;
    this.onchanged = null;
};

ImageAreaSelection.prototype = {

    /**
     * Sets up the gui and the ResizeInterAction that will make us resizeable.
     */
    init: function(display, options)
    {
        this.display = display;
        this.stage = options.stage;
        this.options = $.extend({}, ImageAreaSelection.DEFAULT_OPTIONS, options || {});

        this.selection_rect = this.createSelectionRect();
        this.resize_handles = this.createResizeHandles();
        this.shapes_group = this.createShapesGroup();
        this.ratio = this.selection_rect.getWidth() / this.selection_rect.getHeight(); // @todo make dynamic (settable)
        this.setDragBounds({
            top: 0,
            right: this.stage.getWidth(),
            bottom: this.stage.getHeight(),
            left: 0
        });

        this.layer = new Kinetic.Layer({
            id: 'selection-layer',
            visible: this.options.show || false
        });
        this.layer.add(this.shapes_group);
        
        // Hook up with a resize tracker so we can react to the user wanting to alter the current selection state.
        this.resizeInteraction = new ResizeInteraction();
        this.resizeInteraction.init(this);

        this.resize_overlay = new SelectionOverlay();
        this.resize_overlay.init(this);

        this.stage.add(this.layer);
    },

    /**
     * Creates the rect-shape that represents our current selection.
     */
    createSelectionRect: function()
    {
        return new Kinetic.Rect({
            id: 'selection-rect',
            width: this.options.width,
            height: this.options.height,
            fill: "rgba(0, 0, 0, 0)",
            stroke: "white",
            strokeWidth: this.options.stroke,
            x: 0,
            y: 0
        });
    },

    /**
     * Creates our resize handles according to the definitions in ImageAreaSelection.HANDLES.
     */
    createResizeHandles: function()
    {
        var that = this, 
            resize_handles = [], 
            coord_map = this.calculateResizeHandleCoordMap();

        _.each(ImageAreaSelection.HANDLES, function(handle_def)
        {
            resize_handles.push(
                that.createResizeHandle(handle_def, coord_map)
            );
        });

        return resize_handles;
    },

    /**
     * Creates a rect shape that represents the resize handle,
     * as described by the passed handle_def.
     */
    createResizeHandle: function(handle_def, coord_map)
    {
        return new Kinetic.Rect({
            width: this.options.size,
            height: this.options.size,
            fill: this.options.fill,
            stroke: this.options.stroke,
            strokeWidth: this.options.stroke_width - 1, // always create a small contrast between resize handles and rect stroke
            x: coord_map[handle_def.x], 
            y: coord_map[handle_def.y]
        });
    },

    /**
     * Calculates coordinates that are used to position our resize handle shapes
     * along the border of our selection rect.
     * The keys of the returned object map to the 'x' and 'y' values 
     * of a handle definition inside the ImageAreaSelection.HANDLES array.
     */
    calculateResizeHandleCoordMap: function()
    {
        return {
            north: -1 * (this.options.size / 2),
            east: this.selection_rect.getWidth() - (this.options.size / 2),
            south: this.selection_rect.getHeight() - (this.options.size / 2),
            west: -1 * (this.options.size / 2),
            center: (this.selection_rect.getWidth() / 2) - (this.options.size / 2),
            middle: (this.selection_rect.getHeight() / 2) - (this.options.size / 2)
        };
    },

    /**
     * Creates a Kinetic.Group that holds all our shapes (select rect and resize handle rects).
     * The created group is also the handler of our exposed drag behaviour.
     */
    createShapesGroup: function()
    {
        var shapes_group = new Kinetic.Group({
            draggable: true,
            x: (this.stage.getWidth() / 2) - (this.options.width / 2), // center the shapes_group on stage
            y: (this.stage.getHeight() / 2) - (this.options.height / 2)
        });

        shapes_group.add(this.selection_rect);
        _.each(this.resize_handles, function(handle) 
        { 
            shapes_group.add(handle); 
        });

        return shapes_group;
    },

    /**
     * Calculates the bounds of the image which is currently loaded
     * by the main display.
     */
    setDragBounds: function(drag_bounds)
    {
        this.drag_bounds = drag_bounds;
        this.shapes_group.setDragBounds(this.drag_bounds);
    },

    /**
     * After the position or dimensions of the selection rect have changed,
     * we need to get our resize handles back on the track.
     */
    correctResizeHandlePositions: function()
    {
        var that = this, 
            idx = 0,
            coord_map = this.calculateResizeHandleCoordMap();

        _.each(ImageAreaSelection.HANDLES, function(handle_def)
        {
            var handle = that.resize_handles[idx++];
            handle.setX(coord_map[handle_def.x]);
            handle.setY(coord_map[handle_def.y]);
        });
    },

    /**
     * Returns the bounds (top, right, bottom, left) of the image area,
     * that is currently selected.
     * The coords returned are relative to the image's current position.
     */ 
    getSelection: function(relative_to)
    {
        var select_pos = this.selection_rect.getAbsolutePosition(),
            select_x, select_y;

        if (typeof relative_to === 'object')
        {
            select_x = select_pos.x - relative_to.x;
            select_y = select_pos.y - relative_to.y;
        }
        else
        {
            select_x = select_pos.x;
            select_y = select_pos.y;
        }

        return {
            top: select_y,
            right: select_x + this.selection_rect.getWidth(),
            bottom: select_y + this.selection_rect.getHeight(),
            left: select_x
        };
    },

    /**
     * Sets the selection rect's pos and dimenions.
     * This method triggers a redraw with a former repositioning of our handles.
     */
    setSelection: function(selection)
    {
        this.selection_rect.setWidth(selection.dim.width);
        this.selection_rect.setHeight(selection.dim.height);

        this.shapes_group.setX(selection.pos.x);
        this.shapes_group.setY(selection.pos.y);

        this.correctResizeHandlePositions();
        this.resize_overlay.update();

        this.options.onchanged(selection);
        this.layer.draw();
    },

    setResizeMode: function(mode_name)
    {
        this.resizeInteraction.setMode(mode_name);
    },

    /**
     * Returns an array with our current handles (Kinetic.Rect).
     * This method returns a new array and not the instance actually used by the select rect.
     */
    getHandles: function(idx)
    {
        return $.merge([], this.resize_handles);
    },

    /**
     * Returns our selection rect (Kinetic.Rect) instance.
     */
    getSelectionRect: function()
    {
        return this.selection_rect;
    },

    getImageBoundry: function()
    {
        return this.display.getImageBoundry();
    },

    /**
     * Returns our layer (Kinetic.Layer) instance.
     */
    getLayer: function()
    {
        return this.layer;
    },

    /**
     * Shows the selection stuff to the user.
     */
    show: function()
    {
        this.layer.show();
        this.layer.draw();
    },

    /**
     * Hides the selection stuff from the user.
     */
    hide: function()
    {
        this.layer.hide();
        this.layer.draw();
    }
};

/**
 * An array holding an object defines a resize handle (id and position).
 * The 'x' and 'y' values of a handle definition are expanded to concrete coords 
 * by our calculateResizeHandleCoordMap method.
 *
 * @notice The order is important as we want to be able to calc the opposite side
 * handle of a given handle by adding 4 to the give index.
 */
ImageAreaSelection.HANDLES = [
    { x: 'west', y: 'north' }, // northWest
    { x: 'center', y: 'north' }, // north
    { x: 'east', y: 'north' }, // northEast
    { x: 'east', y: 'middle' }, // east
    { x: 'east', y: 'south' }, // southEast
    { x: 'center', y: 'south' }, // south
    { x: 'west', y: 'south' }, // southWest
    { x: 'west', y: 'middle' } // west
];

/**
 * Holds the default options that we are initialized with,
 * if no specific value is found inside the provided external options 'hash'.
 * Options wihtout default values are also listed here and simple have the value null.
 */
ImageAreaSelection.DEFAULT_OPTIONS = {
    size: 7,
    fill: "rgba(23, 23, 223, 1)",
    show: false,
    stroke: "white",
    stroke_width: 2,
    keep_ratio: false,
    onchanged: function(){}
};
