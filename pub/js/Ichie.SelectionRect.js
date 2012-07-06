/**
 * #####################################
 * #    Ichie - SelectionRect Def    #
 * #####################################
 */
Ichie.SelectionRect = function(stage, options)
{
    this.stage = stage;

    options = options || {};
    this.options = options;
    this.options.size = options.size || 7;
    this.options.fill = options.fill || "rgba(23, 23, 223, 1)";
    this.options.stroke = options.stroke || "white";
    this.options.stroke_width = options.stroke_width || 1;
    this.options.keep_ratio = options.keep_ratio || false;

    this.ratio = null;
    this.shapes_groupGroup = null;
    this.layer = null;
    this.resize_handles = null;
    this.crop_rect = null;
    
    this.initLayer();
};

Ichie.SelectionRect.prototype.initLayer = function()
{
    // Create our cropping rectangle.
    this.crop_rect = this.createCropRect();
    this.ratio = this.crop_rect.getWidth() / this.crop_rect.getHeight();
    // Create our resize (drag) handles.
    this.resize_handles = this.createResizeHandles();
    // Group shapes_group together for more coding convenience.
    this.shapes_group = new Kinetic.Group({ 
        draggable: true,
        x: (this.stage.getWidth() / 2) - (this.options.width / 2),
        y: (this.stage.getHeight() / 2) - (this.options.height / 2)
    });
    this.shapes_group.add(this.crop_rect);
    for (var name in this.resize_handles)
    {
        this.shapes_group.add(this.resize_handles[name]);
    }
    this.applyCropRectDragBounds();
    this.layer = new Kinetic.Layer();
    //this.layer = this.stage.get('#layer-main')[0];
    this.layer.add(this.shapes_group);
};

Ichie.SelectionRect.prototype.applyCropRectDragBounds = function()
{
    // Calc and apply drag bounds to our 'shapes_group' group.
    var img = this.stage.get('#src-img')[0];
    var pos = img.getAbsolutePosition();
    this.shapes_group.setDragBounds({
        top: pos.y,
        left: pos.x,
        right: pos.x + img.getWidth() - this.crop_rect.getWidth(),
        bottom: pos.y + img.getHeight() - this.crop_rect.getHeight()
    });
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

Ichie.SelectionRect.prototype.repositionResizeHandles = function()
{
    var that = this;
    var handle_defs = Ichie.SelectionRect.HANDLES;
    var coord_map = this.buildResizeHandleCoordMap();
    for (var handle_id in handle_defs)
    {
        var handle = this.shapes_group.get('#'+handle_id)[0];
        var handle_coords = handle_defs[handle_id];
        handle.setX(coord_map[handle_coords.x]);
        handle.setY(coord_map[handle_coords.y]);
    }
};

Ichie.SelectionRect.prototype.createResizeHandles = function()
{
    var that = this;
    var resize_handles = {};
    var handle_defs = Ichie.SelectionRect.HANDLES;
    for (var handle_id in handle_defs)
    {
        resize_handles[handle_id] = that.createResizeHandle(
            handle_id, 
            handle_defs[handle_id]
        );
    }
    return resize_handles;
};

Ichie.SelectionRect.prototype.createResizeHandle = function(handle_name, pos)
{
    var reisze_handle_opts = {
      width: this.options.size,
      height: this.options.size,
      fill: this.options.fill,
      stroke: this.options.stroke,
      strokeWidth: this.options.stroke_width,
      draggable: true
    };
    var coord_map = this.buildResizeHandleCoordMap();
    var rect = new Kinetic.Rect(
        $.extend(
            {},
            reisze_handle_opts,
            { id: handle_name, x: coord_map[pos.x], y: coord_map[pos.y] }
        )
    );
    var that = this;
    rect.on("mousedown touchstart", function() {
        that.shapes_group.setDraggable(false);
    });
    rect.on("dragstart", function() {
        rect.setDragBounds(
            that.buildResizeHandleDragBounds(handle_name)
        );
    });
    rect.on("dragmove", function(event) {
        that.onResizeHandleMoved(event, rect);
    });
    rect.on("dragend", function() {
        that.shapes_group.setDraggable(true);
        rect.setDragBounds(
            that.buildResizeHandleDragBounds('northWest')
        );
    });
    return rect;
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

Ichie.SelectionRect.prototype.buildResizeHandleDragBounds = function(handle_name)
{
    var handle_rect = this.shapes_group.get('#'+handle_name)[0];
    var pos = handle_rect.getAbsolutePosition();
    var img = this.stage.get('#src-img')[0];
    var img_pos = img.getAbsolutePosition();
    var center_offset = (this.options.size / 2);
    var vertical_boundry = {
        left: pos.x, right: pos.x,
        top: img_pos.y - center_offset, 
        bottom: img_pos.y + img.getHeight() - center_offset
    };
    var horizontal_boundry = {
        top: pos.y, bottom: pos.y,
        left: img_pos.x - center_offset, 
        right: img_pos.x + img.getWidth() - center_offset
    };
    var img_boundry = {
        top: img_pos.y - center_offset, 
        bottom: img_pos.y + img.getHeight() - center_offset,
        left: img_pos.x - center_offset, 
        right: img_pos.x + img.getWidth() - center_offset
    };
    var boundry_map = {
        'northWest': img_boundry,
        'north': vertical_boundry,
        'northEast': img_boundry,
        'west': horizontal_boundry,
        'east': horizontal_boundry,
        'southWest': img_boundry,
        'south': vertical_boundry,
        'southEast': img_boundry
    };
    return boundry_map[handle_name];
};

Ichie.SelectionRect.prototype.onResizeHandleMoved = function(event, handle_rect)
{
    var pos = handle_rect.getPosition();
    var handle_id = handle_rect.getId();
    var center_offset = (this.options.size / 2);
    var handle_center_x = pos.x + center_offset;
    var handle_center_y = pos.y + center_offset;
    var handle_abspos = handle_rect.getAbsolutePosition();
    var croprect_relpos = this.crop_rect.getPosition();

    if (/east$/ig.test(handle_id))
    {
        this.crop_rect.setWidth(handle_center_x - croprect_relpos.x);
    }
    if (/west$/ig.test(handle_id))
    {
        this.crop_rect.setWidth(this.crop_rect.getWidth() + croprect_relpos.x - handle_center_x);
        this.shapes_group.setX(
            this.shapes_group.getAbsolutePosition().x
            + handle_abspos.x
            - this.crop_rect.getAbsolutePosition().x + center_offset
        );
    }
    if (/^north/ig.test(handle_id))
    {
        this.crop_rect.setHeight(this.crop_rect.getHeight() + croprect_relpos.y - handle_center_y);
        this.shapes_group.setY(
            this.shapes_group.getAbsolutePosition().y 
            + handle_abspos.y 
            - this.crop_rect.getAbsolutePosition().y + center_offset
        );
    }
    if (/^south/ig.test(handle_id))
    {
        this.crop_rect.setHeight(handle_center_y - croprect_relpos.y);
    }


    if (this.options.keep_ratio)
    {
        if (event.mozMovementX > event.mozMovementY)
        {
            this.crop_rect.setHeight(
                this.crop_rect.getWidth() / this.ratio
            );
        }
        else
        {
            this.crop_rect.setWidth(
                this.crop_rect.getHeight() * this.ratio
            );
        }
    }

    this.applyCropRectDragBounds();
    this.repositionResizeHandles();
    this.layer.draw();
};

Ichie.SelectionRect.prototype.draw = function()
{
    this.stage.add(this.layer);
    this.layer.draw();
};

Ichie.SelectionRect.HANDLES = handle_defs = { 
    'northWest': { x: 'west', y: 'north' },
    'north': { x: 'center', y: 'north' },
    'northEast': { x: 'east', y: 'north' },
    'west': { x: 'west', y: 'middle' },
    'east': { x: 'east', y: 'middle' },
    'southWest': { x: 'west', y: 'south' },
    'south': { x: 'center', y: 'south' },
    'southEast': { x: 'east', y: 'south' }
};
