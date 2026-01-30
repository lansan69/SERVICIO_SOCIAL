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

                // --- FIX STARTS HERE ---
                items.rename.label = "Renombrar";
                items.rename.action = function (data) {
                    var inst = $.jstree.reference(data.reference);
                    var obj = inst.get_node(data.reference);

                    // 1. Get the current full HTML (e.g., "Juan <span...>|</span> <span...>5</span>")
                    var fullHtml = obj.text;

                    // 2. Extract ONLY the name. 
                    // We split by the first HTML tag (<) and take the first part.
                    var plainName = fullHtml.split('<')[0].trim();

                    // 3. Trigger the edit mode with the CLEAN name
                    inst.edit(obj, plainName);
                };
                // --- FIX ENDS HERE ---

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
            // 1. Check if text actually changed
            if (data.text === data.old) return;

            // 2. Sanitize just to be safe (though step 1 mostly solves it)
            // We assume the user typed a plain name, but let's trim it.
            let cleanName = data.text.trim();

            // If for some reason HTML got in, strip it entirely
            if (cleanName.includes('<')) {
                cleanName = cleanName.split('<')[0].trim();
            }

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
                    // IMPORTANT: Refresh the tree immediately.
                    // This reloads the PHP data, which adds the badges back to the new name.
                    $('#arbol_ejecutivos').jstree(true).refresh();
                }
            });
        }) 1
        .on("delete_node.jstree", function (e, data) {
            $.ajax({ url: API_URL, type: 'POST', data: { action: 'eliminar_nodo', id: data.node.id } });
        });

    $('#arbol_ejecutivos').on('click', '.badge-click', function (e) {
        // 1. Prevent the tree from selecting/toggling the node when clicking the badge
        e.preventDefault();
        e.stopPropagation();

        // 2. Extract data from the clicked badge
        const id = $(this).data('id');
        const scope = $(this).data('scope'); // 'padre' (White) or 'arbol' (Purple)

        console.log("Badge clicked:", id, scope);

        // 3. Call the function in handson.js
        if (typeof cargarCitasFiltradas === 'function') {
            cargarCitasFiltradas(id, scope);
        } else {
            console.error("Function cargarCitasFiltradas not found in handson.js");
        }
    });
});
