/*global ImageFilters:false*/

var FilterCommand = function()
{
    this.filter_name = null;
    this.ctx = null;
    this.area = null;
    this.original_data = null;
};

FilterCommand.prototype = {

    init: function(options)
    {
        this.filter_name = options.filter_name;
        this.ctx = options.context;
        this.area = options.selection;
    },

    execute: function()
    {
        this.original_data = this.ctx.getImageData(
            this.area.left, 
            this.area.top, 
            this.area.right - this.area.left, 
            this.area.bottom - this.area.top
        );
        var imageData = this.ctx.getImageData(
            this.area.left, 
            this.area.top, 
            this.area.right - this.area.left, 
            this.area.bottom - this.area.top
        );
        var filtered = ImageFilters[this.filter_name](imageData);
        this.ctx.putImageData(filtered, this.area.left, this.area.top);
    },

    revert: function()
    {
        this.ctx.putImageData(
            this.original_data, 
            this.area.left, 
            this.area.top
        );
    }
};