$(document).ready(function () {
    const API_URL = "administrar-ejecutivo-arbol.php";

    $('#arbol_ejecutivos').jstree({
        'core': {
            'check_callback': true,
            'data': {
                'url': API_URL,
                'data': function (node) {
                    return { 'action': 'obtener_arbol', 'id': node.id };
                }
            }
        },
        "types": {
            "default": { "icon": "ki-outline ki-older text-warning" },
            "file": { "icon": "ki-outline ki-file text-warning" },
            "ejecutivo": { "icon": "ki-outline ki-employee color-ejecutivo" },
            "plantel": { "icon": "ki-outline ki-escuela color-plantel" }
        },
        'plugins': ['contextmenu', 'dnd', 'search', 'types', 'wholerow'],
        'contextmenu': {
            'items': function (node) {
                let items = $.jstree.defaults.contextmenu.items();

                items.create.label = "Crear";
                items.remove.label = "Eliminar";
                items.rename.label = "Renombrar";

                // Override rename to strip HTML badges before editing
                items.rename.action = function (data) {
                    var inst = $.jstree.reference(data.reference);
                    var obj = inst.get_node(data.reference);

                    // Split text at HTML tag to get only the name
                    var plainName = obj.text.split('<')[0].trim();
                    inst.edit(obj, plainName);
                };

                return items;
            }
        }
    })
        .on('loaded.jstree', function () {
            $(this).jstree('open_all');
        })
        .on('move_node.jstree', function (e, data) {
            $.ajax({
                url: API_URL,
                type: 'POST',
                data: { action: 'mover_nodo', id: data.node.id, parent_id: data.parent }
            });
        })
        .on("rename_node.jstree", function (e, data) {
            if (data.text === data.old) return;

            // Ensure no HTML tags remain in the name
            let cleanName = data.text.includes('<') ? data.text.split('<')[0].trim() : data.text.trim();

            $.ajax({
                url: API_URL,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'guardar_nodo',
                    id: data.node.id,
                    parent_id: data.node.parent,
                    text: cleanName
                },
                success: function (res) {
                    if (res.success && res.new_id) {
                        data.instance.set_id(data.node, res.new_id);
                    }
                    // Refresh to re-render badges/HTML from server
                    $('#arbol_ejecutivos').jstree(true).refresh();
                }
            });
        })
        .on("delete_node.jstree", function (e, data) {
            $.ajax({ url: API_URL, type: 'POST', data: { action: 'eliminar_nodo', id: data.node.id } });
        });

    // Custom handler for Badge Clicks
    $('#arbol_ejecutivos').on('click', '.badge-click', function (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent tree node selection

        const id = $(this).data('id');
        const scope = $(this).data('scope');

        if (typeof cargarCitasFiltradas === 'function') {
            cargarCitasFiltradas(id, scope);
        } else {
            console.error("Function cargarCitasFiltradas not found in handson.js");
        }
    });
});