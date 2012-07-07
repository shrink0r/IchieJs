/**
 * ########################################
 * #    Ichie - ImageAreaSelection Def    #
 * ########################################
 */
Ichie.ImageAreaSelection = function(ichie, options)
{
    this.ichie = ichie;
    this.stage = ichie.getStage();
    this.options = $.extend(options || {}, Ichie.ImageAreaSelection.DEFAULT_OPTIONS);

    this.ratio = null;
    this.shapes_groupGroup = null;
    this.layer = null;
    this.resize_handles = null;
    this.selection_rect = null;
    this.resizeTracker = null;

    this.init();
};

Ichie.ImageAreaSelection.prototype.init = function()
{
    // Create our selection rectangle.
    this.selection_rect = this.createSelectionRect();
    this.ratio = this.selection_rect.getWidth() / this.selection_rect.getHeight();
    // Create our resize (drag) handles.
    this.resize_handles = this.createResizeHandles();
    // Group shapes_group together for more coding convenience.
    this.shapes_group = this.createShapesGroup();
    // Finally add the group containing the select rect and the resize-handle rects to our layer...
    this.layer = new Kinetic.Layer({
        id: 'selection-layer',
        alpha: this.options.show ? 1 : 0
    });
    this.layer.add(this.shapes_group);
    // ... and add the layer to our stage, then hope the user will engage (ryhme ryhme)
    this.stage.add(this.layer);
    // Hook up with a resize tracker so we can react to the user wanting to alter the current selection state.
    this.resizeTracker = new Ichie.ResizeInteractionTracker(this);
};

Ichie.ImageAreaSelection.prototype.createSelectionRect = function()
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
};

Ichie.ImageAreaSelection.prototype.createResizeHandles = function()
{
    var that = this, resize_handles = [];
    _.each(Ichie.ImageAreaSelection.HANDLES, function(handle_def)
    {
        resize_handles.push(
            that.createResizeHandle(handle_def)
        );
    });
    return resize_handles;
};

Ichie.ImageAreaSelection.prototype.createResizeHandle = function(handle_def)
{
    var coord_map = this.buildResizeHandleCoordMap();
    return new Kinetic.Rect({
        id: handle_def.id,
        width: this.options.size,
        height: this.options.size,
        fill: this.options.fill,
        stroke: this.options.stroke,
        strokeWidth: this.options.stroke_width - 1, // always create a small contrast between resize handles and rect stroke
        x: coord_map[handle_def.x], 
        y: coord_map[handle_def.y]
    });
};

Ichie.ImageAreaSelection.prototype.buildResizeHandleCoordMap = function()
{
    return {
        north: -1 * (this.options.size / 2),
        east: this.selection_rect.getWidth() - (this.options.size / 2),
        south: this.selection_rect.getHeight() - (this.options.size / 2),
        west: -1 * (this.options.size / 2),
        center: (this.selection_rect.getWidth() / 2) - (this.options.size / 2),
        middle: (this.selection_rect.getHeight() / 2) - (this.options.size / 2)
    };
};

Ichie.ImageAreaSelection.prototype.createShapesGroup = function()
{
    var shapes_group = new Kinetic.Group({
        draggable: true,
        x: (this.stage.getWidth() / 2) - (this.options.width / 2), // center the shapes_group on stage
        y: (this.stage.getHeight() / 2) - (this.options.height / 2)
    });
    shapes_group.setDragBounds(
        this.calculateResizeDragBounds() // lock the "shapes_group" to our image's dimensions
    );
    shapes_group.add(this.selection_rect);
    _.each(this.resize_handles, function(handle) { shapes_group.add(handle); });
    return shapes_group;
};

Ichie.ImageAreaSelection.prototype.calculateResizeDragBounds = function()
{
    var img = this.ichie.getImage(), pos = img.getAbsolutePosition();
    return {
        top: pos.y,
        left: pos.x,
        right: pos.x + img.getWidth() - this.selection_rect.getWidth(),
        bottom: pos.y + img.getHeight() - this.selection_rect.getHeight()
    };
};

Ichie.ImageAreaSelection.prototype.onResizeHandleMoved = function(event, handle_rect)
{
    // @todo react to the ResizeInterActionHandler's resize event's and do stuff ...
    this.repositionResizeHandles();
    this.layer.draw();
};

Ichie.ImageAreaSelection.prototype.repositionResizeHandles = function()
{
    var that = this, coord_map = this.buildResizeHandleCoordMap();
    _.each(Ichie.ImageAreaSelection.HANDLES, function(handle_def)
    {
        var handle = that.shapes_group.get('#'+handle_def.id)[0];
        handle.setX(coord_map[handle_def.x]);
        handle.setY(coord_map[handle_def.y]);
    });
};

Ichie.ImageAreaSelection.prototype.getHandles = function(idx)
{
    return this.resize_handles;
};

Ichie.ImageAreaSelection.prototype.show = function()
{
    this.layer.setAlpha(1);
    this.layer.draw();
};

Ichie.ImageAreaSelection.prototype.hide = function()
{
    this.layer.setAlpha(0);
    this.layer.draw();
};

Ichie.ImageAreaSelection.HANDLES = [
    { id: 'northWest', x: 'west', y: 'north' },
    { id: 'north', x: 'center', y: 'north' },
    { id: 'northEast', x: 'east', y: 'north' },
    { id: 'east', x: 'east', y: 'middle' },
    { id: 'southEast', x: 'east', y: 'south' },
    { id: 'south', x: 'center', y: 'south' },
    { id: 'southWest', x: 'west', y: 'south' },
    { id: 'west', x: 'west', y: 'middle' }
];

Ichie.ImageAreaSelection.DEFAULT_OPTIONS = {
    size: 7,
    fill: "rgba(23, 23, 223, 1)",
    show: false,
    stroke: "white",
    stroke_width: 2,
    keep_ratio: false
};