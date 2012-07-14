/*global ImageFilters:false */

var PasteCommand = function()
{
    this.canvas = null;
    this.ctx = null;
    this.original_data = null;
};

PasteCommand.prototype = {

    init: function(canvas, options)
    {
        this.options = $.extend({}, PasteCommand.DEFAULT_OPTIONS, options || {});
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
    },

    execute: function()
    {
        var data_copy = this.ctx.createImageData(
            this.options.data.width,
            this.options.data.height
        );
        ImageFilters.Copy(this.options.data, data_copy);

        this.original_data = this.ctx.getImageData(
            this.options.coords.x,
            this.options.coords.y,
            this.options.data.width,
            this.options.data.height
        );

        this.ctx.putImageData(
            this.options.data,
            this.options.coords.x, 
            this.options.coords.y
        );

        this.options.data = data_copy;
        this.onExecuted(this.canvas);
    },

    revert: function()
    {
        this.ctx.putImageData(
            this.original_data,
            this.options.coords.x, 
            this.options.coords.y
        );
        this.onExecuted(this.canvas);
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

PasteCommand.DEFAULT_OPTIONS = {
    onexecuted: function() {}
};