window.isTreeExternalAction = false; 

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
            "default": { "icon": "ki-outline ki-employee color-ejecutivo" },
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

                items.rename.action = function (data) {
                    var inst = $.jstree.reference(data.reference);
                    var obj = inst.get_node(data.reference);
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
            data: { action: 'mover_nodo', id: data.node.id, parent_id: data.parent },
            success: function (res) {
                if (res.success) {
                    socket.send(JSON.stringify({
                        type: 'MOVER_EJECUTIVO',
                        user: user,
                        log: res.message,
                        node_id: data.node.id,
                        parent_id: data.parent,
                        position: data.position,
                    }));
                }
            }
        });
    })
    .on("rename_node.jstree", function (e, data) {
        if (isTreeExternalAction) return;
        if (data.text === data.old) return;

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
                if (res.success) {
                    $('#arbol_ejecutivos').jstree(true).refresh();
                    if (res.new_id) {
                        socket.send(JSON.stringify({
                            type: 'CREAR_EJECUTIVO',
                            log: "Se creó un nuevo nodo",
                            user: user,
                            node_id: res.new_id,
                            parent_id: data.node.parent,
                            text: data.node.text,
                            node_type: data.node.type
                        }));
                    } else {
                        socket.send(JSON.stringify({
                            type: 'RENOMBRAR_EJECUTIVO',
                            log: "Se renombró un ejecutivo",
                            node_id: data.node.id,
                            value: cleanName,
                        }));
                    }
                }
            }
        });
    })
    .on("delete_node.jstree", function (e, data) {
        $.ajax({ 
            url: API_URL, 
            type: 'POST', 
            data: { action: 'eliminar_nodo', id: data.node.id },
            success: function (res) {
                if (res.success) {
                    $('#arbol_ejecutivos').jstree(true).refresh();
                    socket.send(JSON.stringify({
                        type: 'ELIMINAR_EJECUTIVO',
                        log: "Se eliminó el nodo",
                        node_id: data.node.id
                    }));
                }
            }
        });
    });

    $('#arbol_ejecutivos').on('click', '.badge-click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const id = $(this).data('id');
        const scope = $(this).data('scope');

        if (typeof cargarCitasFiltradas === 'function') {
            cargarCitasFiltradas(id, scope);
        } else {
            console.error("Function cargarCitasFiltradas not found in handson.js");
        }
    });
});