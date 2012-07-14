
var CropCommand = function()
{
    this.canvas = null;
    this.ctx = null;
    this.original_data = null;
};

CropCommand.prototype = {

    init: function(canvas, options)
    {
        this.options = $.extend({}, CropCommand.DEFAULT_OPTIONS, options || {});
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    },

    execute: function()
    {
        this.original_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        var x = this.options.bounds.left,
            y = this.options.bounds.top,
            width = this.options.bounds.right - this.options.bounds.left,
            height = this.options.bounds.bottom - this.options.bounds.top,
            cropped_data = this.ctx.getImageData(x, y, width, height);

        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var tmp_ctx = canvas.getContext("2d");
        tmp_ctx.putImageData(cropped_data, 0, 0);

        this.onExecuted(canvas);
    },

    revert: function()
    {
        var canvas = document.createElement("canvas");
        canvas.width = this.original_data.width;
        canvas.height = this.original_data.height;
        var tmp_ctx = canvas.getContext("2d");
        tmp_ctx.putImageData(this.original_data, 0, 0);

        this.onExecuted(canvas);
    },

    onExecuted: function(canvas)
    {
        var image = new Image(),
            that = this;
        image.onload = function()
        {
            that.options.onexecuted(image);
        };
        image.src = canvas.toDataURL();
    }
};

CropCommand.DEFAULT_OPTIONS = {
    onexecuted: function() {}    
};