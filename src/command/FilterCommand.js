/*global ImageFilters:false*/

var FilterCommand = function()
{
    this.canvas = null;
    this.ctx = null;
    this.original_data = null;
};

FilterCommand.prototype = {

    init: function(canvas, options)
    {
        this.options = $.extend({}, FilterCommand.DEFAULT_OPTIONS, options || {});
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    },

    execute: function()
    {
        var x = this.options.bounds.left,
            y = this.options.bounds.top,
            width = this.options.bounds.right - this.options.bounds.left,
            height = this.options.bounds.bottom - this.options.bounds.top,
            image_data = this.ctx.getImageData(x, y, width, height);
            
        this.original_data = this.ctx.getImageData(x, y, width, height);

        var filtered = ImageFilters[this.options.filter](image_data);
        this.ctx.putImageData(filtered, x, y);

        this.onExecuted(this.canvas);
    },

    revert: function()
    {
        this.ctx.putImageData(
            this.original_data, 
            this.options.bounds.left, 
            this.options.bounds.top
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

FilterCommand.DEFAULT_OPTIONS = {
    onexecuted: function() {}    
};