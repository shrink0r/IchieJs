/**
 * #####################################
 * #    IchieJs - SelectionRect Def    #
 * #####################################
 */
IchieJs.SelectionRect = function(stage, options)
{
    this.stage = stage;
    this.options = options;
    this.shapes = null;
    this.resize_handles = null;
    this.crop_rect = null;

    this.initShapes();
};

IchieJs.SelectionRect.prototype.initShapes = function()
{
    // Create our cropping rectangle.
    this.crop_rect = this.createCropRect();
    // Create our resize (drag) handles.
    this.resize_handles = this.createResizeHandles();
    // Group shapes together for more coding convenience.
    this.shapes = new Kinetic.Group({ 
        draggable: true,
        x: (this.stage.getWidth() / 2) - (this.options.width / 2),
        y: (this.stage.getHeight() / 2) - (this.options.height / 2)
    });
    this.shapes.add(this.crop_rect);
    for (var name in this.resize_handles)
    {
        this.shapes.add(this.resize_handles[name]);
    }
    // Calc and apply drag bounds to our 'shapes' group.
    var img = this.stage.get('#src-img')[0];
    var pos = img.getAbsolutePosition();
    this.shapes.setDragBounds({
        top: pos.y,
        left: pos.x,
        right: pos.x + img.getWidth() - this.options.width,
        bottom: pos.y + img.getHeight() - this.options.height
    });
};

IchieJs.SelectionRect.prototype.createCropRect = function()
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

IchieJs.SelectionRect.prototype.createResizeHandles = function()
{
    var that = this;
    var resize_handles = {};
    var handle_defs = { 
        'northWest': { x: 'west', y: 'north' },
        'north': { x: 'center', y: 'north' },
        'northEast': { x: 'east', y: 'north' },
        'west': { x: 'west', y: 'middle' },
        'east': { x: 'east', y: 'middle' },
        'southWest': { x: 'west', y: 'south' },
        'south': { x: 'center', y: 'south' },
        'southEast': { x: 'east', y: 'south' }
    };
    for (var handle_id in handle_defs)
    {
        (function() {
            var name = handle_id;
            var pos = handle_defs[handle_id];
            resize_handles[handle_id] = that.createResizeHandle(name, pos);
        })();
    }
    return resize_handles;
};

IchieJs.SelectionRect.prototype.createResizeHandle = function(name, pos)
{
    var reisze_handle_opts = {
      width: 2,
      height: 2,
      fill: "rgba(223, 23, 23, 1)",
      stroke: "red",
      strokeWidth: 1
    };
    console.log(reisze_handle_opts);
    var coord_map = this.buildResizeHandleCoordMap(this.crop_rect, reisze_handle_opts);
    var rect = new Kinetic.Rect(
        $.extend(
            {},
            reisze_handle_opts,
            { id: name, x: coord_map[pos.x], y: coord_map[pos.y] }
        )
    );
    var that = this;
    rect.on("mousedown touchstart", function() {
        console.log("resize handle " + name + " - mousedown", arguments);
        that.stage.on('mousemove touchmove', function()
        {
            console.log("mousemove baby!!!");
        });
    });
    rect.on("mouseup touchend", function() {
        console.log("resize handle " + name + " - mouseup", arguments);
    });
    return rect;
};

IchieJs.SelectionRect.prototype.buildResizeHandleCoordMap = function(src_rect, reisze_handle_opts)
{
    return {
        north: -1 * (reisze_handle_opts.height / 2),
        east: src_rect.getWidth() - (reisze_handle_opts.width / 2),
        south: src_rect.getHeight() - (reisze_handle_opts.height / 2),
        west: -1 * (reisze_handle_opts.width / 2),
        center: (src_rect.getWidth() / 2) - (reisze_handle_opts.width / 2),
        middle: (src_rect.getHeight() / 2) - (reisze_handle_opts.height / 2)
    };
};

IchieJs.SelectionRect.prototype.getShapes = function()
{
    return this.shapes;
};

IchieJs.SelectionRect.prototype.constructor = IchieJs.SelectionRect;
