/*global ResizeInteraction:false, DefaultMode:false*/

/**
 * Implements the logic for the 'locked-ratio' resize mode,
 * allowing the user to resize in all directions thereby keeping the selection's ratio.
 */
var LockedRatioMode = function()
{
    DefaultMode.prototype.constructor.call(this);
};
LockedRatioMode.prototype = new DefaultMode();
LockedRatioMode.prototype.constructor = LockedRatioMode;

/**
 * Get the rect resize/reposition calcultions done for 'locked-ratio' selections.
 */
LockedRatioMode.prototype.buildSelectGeometry = function(handle_index, delta)
{
    var selection = DefaultMode.prototype.buildSelectGeometry.call(this, handle_index, delta); // luke, I am your father!

    var image_selection = this.interaction.getImageSelection(),
        dir = ResizeInteraction.DIRECTION,
        direction = this.determineResizeDirection(handle_index, delta),
        dimensions = selection.dim,
        position = selection.pos,
        boundry = this.interaction.getBoundry(),
        selection_rect = image_selection.getSelectionRect(),
        selection_pos = selection_rect.getAbsolutePosition();

    var reposition_x = [0, 6], reposition_y = [0, 2]; // handles that require repositioning of the select rect
    if (direction === dir.HORIZONTAL)
    {
        if (position.y + dimensions.height >= boundry.bottom && 
            (3 <= handle_index && 7 >= handle_index) && 
            selection_rect.getWidth() <= dimensions.width)
        {
            dimensions.height = boundry.bottom - position.y;
            dimensions.width = dimensions.height * image_selection.ratio;
            position.x = selection_pos.x;
        }
        else if (position.y <= boundry.top && 
            (0 <= handle_index && 2 >= handle_index) && 
            selection_rect.getWidth() <= dimensions.width)
        {
            var bottom_bound = position.y + dimensions.height;
            position.y = boundry.top;
            dimensions.height = boundry.top - position.y;
            dimensions.width = dimensions.height * image_selection.ratio;
            position.x = selection_pos.x;
        }
        else
        {
            var new_height = dimensions.width / image_selection.ratio;
            if (-1 !== reposition_y.indexOf(handle_index))
            {
                position.y = selection_pos.y - (new_height - selection_rect.getHeight());
            }
            dimensions.height = new_height;
        }
    }
    else
    {
        if (position.x + dimensions.width >= boundry.right && 
            (1 <= handle_index && 5 >= handle_index) && 
            selection_rect.getHeight() <= dimensions.height)
        {
            dimensions.width = boundry.right - position.x;
            dimensions.height = dimensions.width / image_selection.ratio;
            position.y = selection_pos.y;
        }
        else if (position.x <= boundry.left && 
            (-1 !== [0, 6, 7].indexOf(handle_index)) && 
            selection_rect.getHeight() <= dimensions.height)
        {
            var right_bound = position.x + dimensions.width;
            position.x = boundry.left;
            dimensions.width = right_bound - position.x;
            dimensions.height = dimensions.width / image_selection.ratio;
            position.y = selection_pos.y;
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
    }

    return { pos: position, dim: dimensions };
};

/**
 * Determines which direction the next resize should take.
 * Returns one of the ResizeInteraction.DIRECTION.* 'constants'.
 */
LockedRatioMode.prototype.determineResizeDirection = function(handle_index, delta)
{
    var dir = ResizeInteraction.DIRECTION, 
        direction = DefaultMode.prototype.determineResizeDirection.call(this, handle_index, delta); // oh hai dad

    // The ratio mode only supports one modification direction at a time.
    if (dir.BOTH === direction)
    {
        direction = (Math.abs(delta.x) < Math.abs(delta.y)) ? dir.VERTICAL : dir.HORIZONTAL;
    }
    return direction;
};
