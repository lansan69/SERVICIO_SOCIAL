$(document).ready(function () {
    const API_URL = "administrar-ejecutivo.php";

    // 1. Helper function to assign types based on depth
    function setMedievalType(node, instance) {
        // Safety check
        if (!node || !node.parents) return;

        // jsTree root parent '#' is included in parents array.
        // If parents = ["#"], depth is 0.
        let depth = node.parents.length - 1;

        let type = 'peasant';
        if (depth === 0) type = 'king';
        else if (depth === 1) type = 'lord';
        else if (depth === 2) type = 'knight';
        else if (depth === 3) type = 'soldier';

        // Apply the type
        instance.set_type(node, type);
    }

    $('#arbol_ejecutivos').jstree({
        'core': {
            'check_callback': function (operation, node, node_parent, node_position, more) {
                // Limit depth to 5 (0 to 4)
                if (operation === 'move_node' || operation === 'copy_node') {
                    if (node_parent.parents && node_parent.parents.length >= 5) {
                        return false; // Block drop if too deep
                    }
                }
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
            // We use the base class 'material-icons-tree' + the specific icon class + color
            'king': { 'icon': 'material-icons-tree icon-king text-warning' },
            'lord': { 'icon': 'material-icons-tree icon-lord text-secondary' },
            'knight': { 'icon': 'material-icons-tree icon-knight text-primary' },
            'soldier': { 'icon': 'material-icons-tree icon-soldier text-danger' },
            'peasant': { 'icon': 'material-icons-tree icon-peasant text-success' },
            'default': { 'icon': 'material-icons-tree icon-peasant' }, // Fallback
            'file': { 'icon': 'material-icons-tree icon-peasant' }
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
        .on('refresh.jstree', function () {
            $(this).jstree('open_all');
        })
        // TRIGGER: When data is loaded (initial)
        .on('model.jstree', function (e, data) {
            const instance = $('#arbol_ejecutivos').jstree(true);
            if (data.nodes) {
                data.nodes.forEach(id => {
                    let node = instance.get_node(id);
                    if (node && node.id !== '#') {
                        setMedievalType(node, instance);
                    }
                });
            }
        })
        // TRIGGER: When a node is moved (drag & drop)
        .on('move_node.jstree', function (e, data) {
            let instance = data.instance;

            // Recursive update for children in case a Lord becomes a Peasant
            function updateRecursive(nId) {
                let n = instance.get_node(nId);
                setMedievalType(n, instance);
                if (n.children) {
                    n.children.forEach(childId => updateRecursive(childId));
                }
            }
            updateRecursive(data.node.id);

            // AJAX for moving node
            $.ajax({
                url: API_URL,
                type: 'POST',
                data: { action: 'mover_nodo', id: data.node.id, parent_id: data.parent }
            });
        })
        // TRIGGER: When a node is renamed or created
        .on("rename_node.jstree", function (e, data) {
            if (data.text === data.old) return;

            // Ensure type is correct immediately
            setMedievalType(data.node, data.instance);

            $.ajax({
                url: API_URL,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'guardar_nodo',
                    id: data.node.id,
                    parent_id: data.node.parent,
                    text: data.text
                },
                success: function (res) {
                    if (res.success && res.new_id) {
                        data.instance.set_id(data.node, res.new_id);
                    }
                }
            });
        })
        .on("delete_node.jstree", function (e, data) {
            $.ajax({
                url: API_URL,
                type: 'POST',
                data: { action: 'eliminar_nodo', id: data.node.id }
            });
        });

    // Search Logic
    var to = false;
    $('#arbol_search').keyup(function () {
        if (to) { clearTimeout(to); }
        to = setTimeout(function () {
            var v = $('#arbol_search').val();
            $('#arbol_ejecutivos').jstree(true).search(v);
        }, 250);
    });
});