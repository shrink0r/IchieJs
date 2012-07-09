/**
 * Implements the logic for the 'locked-ratio' resize mode,
 * allowing the user to resize in all directions thereby keeping the selection's ratio.
 */
Ichie.ResizeInteraction.LockedRatioMode = function()
{
    Ichie.ResizeInteraction.DefaultMode.prototype.apply.constructor.call(this);
};
Ichie.ResizeInteraction.LockedRatioMode.prototype = new Ichie.ResizeInteraction.DefaultMode();
Ichie.ResizeInteraction.LockedRatioMode.prototype.constructor = Ichie.ResizeInteraction.LockedRatioMode;

/**
 * Get the rect resize/reposition calcultions done for 'locked-ration' selections.
 */
Ichie.ResizeInteraction.LockedRatioMode.prototype.apply = function(handle_index, delta)
{
    var selection = Ichie.ResizeInteraction.DefaultMode.prototype.apply.call(this, handle_index, delta); // luke, I am your father!

    var image_selection = this.interaction.getImageSelection(),
        dir = Ichie.ResizeInteraction.DIRECTION,
        direction = this.determineResizeDirection(handle_index, delta),
        dimensions = selection.dim,
        position = selection.pos,
        selection_rect = image_selection.getSelectionRect(),
        selection_pos = selection_rect.getAbsolutePosition();

    var reposition_x = [0, 6], reposition_y = [0, 2];
    if (direction === dir.HORIZONTAL)
    {
        var new_height = dimensions.width / image_selection.ratio;
        if (-1 !== reposition_y.indexOf(handle_index))
        {
            position.y = selection_pos.y - (new_height - selection_rect.getHeight());
        }
        dimensions.height = new_height;
    }
    else
    {
        var new_width = dimensions.height * image_selection.ratio;
        if (-1 !== reposition_x.indexOf(handle_index))
        {
            position.x = selection_pos.x - (new_width - selection_rect.getWidth());
        }
        dimensions.width = new_width;
    }
    return { pos: position, dim: dimensions };
};

/**
 * Determines which direction the next resize should take.
 * Returns one of the Ichie.ResizeInteraction.DIRECTION.* 'constants'.
 */
Ichie.ResizeInteraction.LockedRatioMode.prototype.determineResizeDirection = function(handle_index, delta)
{
    var dir = Ichie.ResizeInteraction.DIRECTION, 
        direction = Ichie.ResizeInteraction.DefaultMode.prototype.determineResizeDirection.call(this, handle_index, delta); // oh hai dad

    // The ratio mode only supports one modification direction at a time.
    if (dir.BOTH === direction)
    {
        direction = (Math.abs(delta.x) < Math.abs(delta.y)) ? dir.VERTICAL : dir.HORIZONTAL;
    }
    return direction;
};