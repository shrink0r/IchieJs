var SelectionOverlay = function()
{
    this.image_selection = null;
    this.layer = null;
    this.shapes = null;
};

SelectionOverlay.prototype = {

    init: function(image_selection)
    {
        this.image_selection = image_selection;
        this.layer = new Kinetic.Layer({
            alpha: 0.5
        });

        var boundry = this.image_selection.getImageBoundry();
        this.shapes = {
            north: new Kinetic.Rect({
                fill: 'grey',
                x: boundry.left,
                y: boundry.top,
                width: boundry.right - boundry.left
            }),
            east: new Kinetic.Rect({
                fill: 'grey',
                x: boundry.left
            }),
            south: new Kinetic.Rect({
                fill: 'grey',
                x: boundry.left,
                width: boundry.right - boundry.left
            }),
            west: new Kinetic.Rect({
                fill: 'grey',
                x: boundry.left
            })
        };
        this.layer.add(this.shapes.north);
        this.layer.add(this.shapes.south);
        this.layer.add(this.shapes.east);
        this.layer.add(this.shapes.west);
        this.image_selection.stage.add(this.layer);
    },

    adaptSelection: function(selection)
    {
        var boundry = this.image_selection.getImageBoundry();
        var rect = this.image_selection.getSelectionRect();
        var rect_pos = rect.getAbsolutePosition();
        this.shapes.north.setHeight(
            Math.ceil(rect_pos.y - boundry.top)
        );

        var south_y = rect_pos.y + selection.dim.height;
        this.shapes.south.setY(
            Math.ceil(south_y)
        );
        this.shapes.south.setHeight(
            Math.ceil(boundry.bottom - south_y)
        );

        this.shapes.west.setY(rect_pos.y);
        this.shapes.west.setWidth(rect_pos.x - boundry.left);
        this.shapes.west.setHeight(
            Math.ceil(rect.getHeight())
        );

        var east_x = rect_pos.x + rect.getWidth();
        this.shapes.east.setX(east_x);
        this.shapes.east.setY(
            Math.ceil(rect_pos.y)
        );
        this.shapes.east.setWidth(boundry.right - east_x);
        this.shapes.east.setHeight(
            Math.ceil(rect.getHeight())
        );

        this.layer.draw();
    }
};