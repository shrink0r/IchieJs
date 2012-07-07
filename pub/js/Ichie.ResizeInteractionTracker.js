/**
 * #################################################################################
 * #    Handles propagtion of resize events along with some precalculated data,    #
 * #    that provides a bit convenience when handling mousemove events             #
 * #    in the context of resizing our "SelectionRect".                            #
 * #################################################################################
 */
Ichie.ResizeInteractionTracker = function(selection_rect)
{
    this.selection_rect = selection_rect;
    this.handles = this.selection_rect.getHandles();
    this.last_mousepos = null;
    this.registerHandleEvents();
};

Ichie.ResizeInteractionTracker.prototype.registerHandleEvents = function()
{
    for (var that = this, i = 0; i < this.handles.length; i++)(function(index)
    {
        var handle = that.handles[index];
        var mouseMoveHandler = function(event){ that.onMouseMove(event, index); };
        handle.on('mousedown touchstart', function(event)
        {
            that.active_handle_idx = index;
            that.last_mousepos = { x: event.clientX, y: event.clientY };
            window.document.addEventListener('mousemove', mouseMoveHandler);
        });
        handle.on('mouseup touchend', function()
        {
            that.active_handle_idx = null;
            window.document.removeEventListener('mousemove', mouseMoveHandler);
        });
    })(i);
};

Ichie.ResizeInteractionTracker.prototype.onMouseMove = function(mousemove_event, handle_index)
{
    // @todo do the (handle_index + 4 % 8) thingy to determine the handle
    // that serves as the reference point for (re)positioning after resizing.
    var handle = this.handles[handle_index], evt_x = mousemove_event.clientX, evt_y = mousemove_event.clientY;
    var delta_x = evt_x - this.last_mousepos.x;
    var delta_y = evt_y - this.last_mousepos.y;
    this.last_mousepos = { x: evt_x, y: evt_y };
    // @todo Fire resize event together with the delta and pos data.
};
