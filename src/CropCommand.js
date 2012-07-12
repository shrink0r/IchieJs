
var CropCommand = function()
{
    this.area = null;
    this.canvas_bounds = null;
    this.ctx = null;
    this.original_data = null;
    this.onexecuted = null;
};

CropCommand.prototype = {

    init: function(options)
    {
        this.area = options.selection;
        this.image_bounds = options.image_bounds;
        this.ctx = options.context;
        this.onexecuted = options.onexecuted;
    },

    execute: function()
    {
        this.original_data = this.ctx.getImageData(
            this.image_bounds.left, 
            this.image_bounds.top, 
            this.image_bounds.right - this.image_bounds.left, 
            this.image_bounds.bottom - this.image_bounds.top
        );
        var img_data = this.ctx.getImageData(
            this.area.left, 
            this.area.top,
            this.area.right - this.area.left, 
            this.area.bottom - this.area.top
        );

        var canvas = document.createElement("canvas");
        canvas.width = this.area.right - this.area.left;
        canvas.height = this.area.bottom - this.area.top;
        var tmp_ctx = canvas.getContext("2d");
        tmp_ctx.putImageData(img_data, 0, 0);

        var image = new Image();
        var that = this;
        image.onload = function()
        {
            that.onexecuted(image);
        };
        image.src = canvas.toDataURL();
    },

    revert: function()
    {
        var canvas = document.createElement("canvas");
        canvas.width = this.image_bounds.right - this.image_bounds.left;
        canvas.height = this.image_bounds.bottom - this.image_bounds.top;
        var tmp_ctx = canvas.getContext("2d");
        tmp_ctx.putImageData(this.original_data, 0, 0);

        var image = new Image();
        var that = this;
        image.onload = function()
        {
            that.onexecuted(image);
        };
        image.src = canvas.toDataURL();
    }
};