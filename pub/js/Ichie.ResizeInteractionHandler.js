/**
 * #################################################################################
 * #    Handles propagtion of resize events along with some precalculated data,    #
 * #    that provides a bit convenience when handling mousemove events             #
 * #    in the context of resizing our "SelectionRect".                            #
 * #################################################################################
 */
Ichie.ResizeInteractionHandler = function(selection_rect)
{
    this.selection_rect = selection_rect;
    this.handles = this.selection_rect.getHandles();
    this.last_mousepos = null;

    this.registerHandleEvents();
};

Ichie.ResizeInteractionHandler.prototype.registerHandleEvents = function()
{
    for (var that = this, i = 0; i < this.handles.length; i++)(function(index)
    {
        var handle = that.handles[index];
        var mouseMoveHandler = function(){ that.onMouseMove(index); };
        handle.on('mousedown touchstart', function(event)
        {
            that.active_handle_idx = index;
            // @todo set this.last_mousepos
            window.document.addEventListener('mousemove', mouseMoveHandler);
        });
        handle.on('mouseup touchend', function()
        {
            that.active_handle_idx = null;
            window.document.removeEventListener('mousemove', mouseMoveHandler);
        });
    })(i);
};

Ichie.ResizeInteractionHandler.prototype.onMouseMove = function(handle_index)
{
    var handle = this.handles[handle_index];
    console.log("YAY MOUSE MOVED: " + handle_index);
    // @todo Calc delta stuff.
};
