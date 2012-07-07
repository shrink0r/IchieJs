/**
 * #####################################
 * #    Ichie - SelectionRect Def    #
 * #####################################
 */
Ichie.SelectionRect = function(stage, options)
{
    this.stage = stage;
    this.options = $.extend(options || {}, Ichie.SelectionRect.DEFAULT_OPTIONS);

    this.ratio = null;
    this.shapes_groupGroup = null;
    this.layer = null;
    this.resize_handles = null;
    this.crop_rect = null;
    
    this.initLayer();

    this.resizeInteraction = new Ichie.ResizeInteractionHandler(this);
};

Ichie.SelectionRect.prototype.initLayer = function()
{
    // Create our cropping rectangle.
    this.crop_rect = this.createCropRect();
    this.ratio = this.crop_rect.getWidth() / this.crop_rect.getHeight();
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
    // ... and the layer to our stage and hope the user will engage (ryhme ryhme).
    this.stage.add(this.layer);
};

Ichie.SelectionRect.prototype.createCropRect = function()
{
    return new Kinetic.Rect({
        id: 'crop-rect',
        width: this.options.width,
        height: this.options.height,
        fill: "rgba(0, 0, 0, 0)",
        stroke: "white",
        strokeWidth: this.options.stroke,
        x: 0,
        y: 0
    });
};

Ichie.SelectionRect.prototype.createResizeHandles = function()
{
    var that = this,
        resize_handles = [];
    _.each(Ichie.SelectionRect.HANDLES, function(handle_def)
    {
        resize_handles.push(
            that.createResizeHandle(handle_def)
        );
    });
    return resize_handles;
};

Ichie.SelectionRect.prototype.createResizeHandle = function(handle_def)
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


Ichie.SelectionRect.prototype.buildResizeHandleCoordMap = function()
{
    return {
        north: -1 * (this.options.size / 2),
        east: this.crop_rect.getWidth() - (this.options.size / 2),
        south: this.crop_rect.getHeight() - (this.options.size / 2),
        west: -1 * (this.options.size / 2),
        center: (this.crop_rect.getWidth() / 2) - (this.options.size / 2),
        middle: (this.crop_rect.getHeight() / 2) - (this.options.size / 2)
    };
};

Ichie.SelectionRect.prototype.createShapesGroup = function()
{
    var shapes_group = new Kinetic.Group({
        draggable: true,
        x: (this.stage.getWidth() / 2) - (this.options.width / 2), // center the shapes_group on stage
        y: (this.stage.getHeight() / 2) - (this.options.height / 2)
    });
    shapes_group.setDragBounds(
        this.calculateResizeDragBounds() // lock the "shapes_group" to our image's dimensions
    );
    shapes_group.add(this.crop_rect);
    _.each(this.resize_handles, function(handle)
    {
        shapes_group.add(handle);
    });
    return shapes_group;
};

Ichie.SelectionRect.prototype.calculateResizeDragBounds = function()
{
    // Calc and apply drag bounds to our 'shapes_group' group.
    var img = this.stage.get('#src-img')[0];
    var pos = img.getAbsolutePosition();
    return {
        top: pos.y,
        left: pos.x,
        right: pos.x + img.getWidth() - this.crop_rect.getWidth(),
        bottom: pos.y + img.getHeight() - this.crop_rect.getHeight()
    };
};

Ichie.SelectionRect.prototype.onResizeHandleMoved = function(event, handle_rect)
{
    // @todo react to the ResizeInterActionHandler's resize event's and do stuff ...
    this.repositionResizeHandles();
    this.layer.draw();
};

Ichie.SelectionRect.prototype.repositionResizeHandles = function()
{
    var that = this, 
        coord_map = this.buildResizeHandleCoordMap();
    _.each(Ichie.SelectionRect.HANDLES, function(handle_def)
    {
        var handle = that.shapes_group.get('#'+handle_def.id)[0];
        handle.setX(coord_map[handle_def.x]);
        handle.setY(coord_map[handle_def.y]);
    });
};

Ichie.SelectionRect.prototype.getHandles = function(idx)
{
    return this.resize_handles;
};

Ichie.SelectionRect.prototype.show = function()
{
    this.layer.setAlpha(1);
    this.layer.draw();
};

Ichie.SelectionRect.prototype.hide = function()
{
    this.layer.setAlpha(0);
    this.layer.draw();
};

Ichie.SelectionRect.HANDLES = [
    { id: 'northWest', x: 'west', y: 'north' },
    { id: 'north', x: 'center', y: 'north' },
    { id: 'northEast', x: 'east', y: 'north' },
    { id: 'east', x: 'east', y: 'middle' },
    { id: 'southEast', x: 'east', y: 'south' },
    { id: 'south', x: 'center', y: 'south' },
    { id: 'southWest', x: 'west', y: 'south' },
    { id: 'west', x: 'west', y: 'middle' }
];

Ichie.SelectionRect.DEFAULT_OPTIONS = {
    size: 7,
    fill: "rgba(23, 23, 223, 1)",
    show: false,
    stroke: "white",
    stroke_width: 2,
    keep_ratio: false
};