/*global ImageFilters: false*/

var ResizeCommand = function()
{
    this.canvas = null;
    this.ctx = null;
    this.original_data = null;
};

ResizeCommand.prototype = {

    init: function(canvas, options)
    {
        this.options = $.extend({}, ResizeCommand.DEFAULT_OPTIONS, options || {});
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    },

    execute: function()
    {
        this.original_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        var src_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var resized_data = ImageFilters.ResizeNearestNeighbor(src_data, this.options.width, this.options.height);
        var canvas = document.createElement("canvas");
        canvas.width = this.options.width;
        canvas.height = this.options.height;
        var tmp_ctx = canvas.getContext("2d");
        tmp_ctx.putImageData(resized_data, 0, 0);

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

ResizeCommand.DEFAULT_OPTIONS = {
    onexecuted: function() {}    
};