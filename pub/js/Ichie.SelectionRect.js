/**
 * #####################################
 * #    Ichie - SelectionRect Def    #
 * #####################################
 */
Ichie.SelectionRect = function(stage, options)
{
    options = options || {};
    this.options = options;
    this.options.size = options.size || 7;
    this.options.fill = options.fill || "rgba(23, 23, 223, 1)";
    this.options.show = options.show || false;
    this.options.stroke = options.stroke || "white";
    this.options.stroke_width = options.stroke_width || 1;
    this.options.keep_ratio = options.keep_ratio || false;

    this.stage = stage;

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
    // Create our cropping rectangle.
    var crop_start_dims = {
        x: 0,
        y: 0,
        width: this.options.width,
        height: this.options.height
    };
    return new Kinetic.Rect(
        $.extend(
            {},
            crop_start_dims,
            {
                fill: "rgba(0, 0, 0, 0)",
                stroke: "white",
                strokeWidth: 2,
                id: 'crop-rect'
            }
        )
    );
};

Ichie.SelectionRect.prototype.createResizeHandles = function()
{
    var that = this;
    var resize_handles = [];
    for (var idx = 0; idx < Ichie.SelectionRect.HANDLES.length; idx++)
    {
        resize_handles.push(
            this.createResizeHandle(idx)
        );
    }
    return resize_handles;
};

Ichie.SelectionRect.prototype.createResizeHandle = function(idx)
{
    var handle_def = Ichie.SelectionRect.HANDLES[idx];
    var coord_map = this.buildResizeHandleCoordMap();
    var reisze_handle_opts = {
      width: this.options.size,
      height: this.options.size,
      fill: this.options.fill,
      stroke: this.options.stroke,
      strokeWidth: this.options.stroke_width
    };
    return new Kinetic.Rect(
        $.extend(
            {},
            reisze_handle_opts,
            { id: handle_def.id, x: coord_map[handle_def.x], y: coord_map[handle_def.y] }
        )
    );
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
    // Group shapes_group together for more coding convenience.
    var shapes_group = new Kinetic.Group({
        draggable: true,
        x: (this.stage.getWidth() / 2) - (this.options.width / 2), // center the shapes_group on stage
        y: (this.stage.getHeight() / 2) - (this.options.height / 2)
    });
    shapes_group.add(this.crop_rect);
    for (var idx = 0; idx < this.resize_handles.length; idx++)
    {
        shapes_group.add(this.resize_handles[idx]);
    }
    shapes_group.setDragBounds(
        this.calcResizeDragBounds()
    );
    return shapes_group;
};

Ichie.SelectionRect.prototype.calcResizeDragBounds = function()
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


    this.repositionResizeHandles();
    this.layer.draw();
};

Ichie.SelectionRect.prototype.repositionResizeHandles = function()
{
    var that = this, coord_map = this.buildResizeHandleCoordMap(), idx = 0, handle_def, handle;
    while (idx < Ichie.SelectionRect.HANDLES.length)
    {
        handle_def = Ichie.SelectionRect.HANDLES[handle_id];
        handle = this.shapes_group.get('#'+handle_def.name)[0];
        handle.setX(coord_map[handle_def.x]);
        handle.setY(coord_map[handle_def.y]);
        idx++;
    }
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