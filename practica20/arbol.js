$(document).ready(function () {
    const API_URL = "administrar-ejecutivo-arbol.php";

    $('#arbol_ejecutivos').jstree({
        'core': {
            'check_callback': function (operation, node, node_parent, node_position, more) {
                return true;
            },
            'data': {
                'url': API_URL,
                'data': function (node) {
                    return { 'action': 'obtener_arbol', 'id': node.id };
                }
            }
        },
        'types': {
            // 1. Generic Person (Default)
            'default': { 'icon': 'material-icons-tree icon-person' },
            'ejecutivo': { 'icon': 'material-icons-tree icon-person' },

            // 2. The Main Plantel (Root)
            'plantel': { 'icon': 'material-icons-tree icon-plantel' }
        },
        'plugins': ['contextmenu', 'dnd', 'search', 'types', 'wholerow'],
        'contextmenu': {
            'items': function (node) {
                let items = $.jstree.defaults.contextmenu.items();
                items.create.label = "Crear";
                items.rename.label = "Renombrar";
                items.remove.label = "Eliminar";
                return items;
            }
        }
    })
        .on('loaded.jstree', function () {
            $(this).jstree('open_all');
        })
        // NOTE: We no longer need the 'model.jstree' event to calculate ranks/medieval types.
        .on('move_node.jstree', function (e, data) {
            $.ajax({
                url: API_URL,
                type: 'POST',
                data: { action: 'mover_nodo', id: data.node.id, parent_id: data.parent }
            });
        })
        .on("rename_node.jstree", function (e, data) {
            if (data.text === data.old) return;
            // Strip out any HTML tags (like the icons) if the user edited the text
            // This regex removes the <span...> parts so we only save the name to DB
            let cleanName = data.text.replace(/<[^>]*>?/gm, '').trim();

            $.ajax({
                url: API_URL, type: 'POST', dataType: 'json',
                data: { action: 'guardar_nodo', id: data.node.id, parent_id: data.node.parent, text: cleanName },
                success: function (res) {
                    if (res.success && res.new_id) data.instance.set_id(data.node, res.new_id);
                    // Refresh the tree to re-calculate icons
                    $('#arbol_ejecutivos').jstree(true).refresh();
                }
            });
        })
        .on("delete_node.jstree", function (e, data) {
            $.ajax({ url: API_URL, type: 'POST', data: { action: 'eliminar_nodo', id: data.node.id } });
        });
});