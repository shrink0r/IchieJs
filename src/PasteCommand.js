/*global ImageFilters:false */

var PasteCommand = function()
{
    this.paste_data = null;
    this.area = null;
    this.canvas = null;
    this.ctx = null;
    this.paste_backup = null;
};

PasteCommand.prototype = {

    init: function(options)
    {
        this.area = options.selection;
        this.canvas = options.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.paste_data = this.ctx.createImageData(
            options.data.width,
            options.data.height
        );
        ImageFilters.Copy(options.data, this.paste_data);
    },

    execute: function()
    {
        this.paste_backup = this.ctx.getImageData(
            this.area.left, 
            this.area.top,
            this.paste_data.width,
            this.paste_data.height
        );
        
        var paste_data = this.ctx.createImageData(
            this.paste_data.width,
            this.paste_data.height
        );
        ImageFilters.Copy(this.paste_data, paste_data);

        this.ctx.putImageData(
            this.paste_data,
            this.area.left, 
            this.area.top
        );
        // make sure we still have paste data, when we are replayed.
        this.paste_data = paste_data;
    },

    revert: function()
    {
        this.ctx.putImageData(
            this.paste_backup,
            this.area.left, 
            this.area.top
        );
    }
};