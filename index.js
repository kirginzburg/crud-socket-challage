"use strict";
function scopeFunc() {
    let apiPath = 'wss://js-assignment.evolutiongaming.com/ws_api';
    let socket = new WebSocket(apiPath);

    let tables = [];

    let sendToSocket = (json) => {
        socket.send(JSON.stringify(json));
    }

    let readyPromise = new Promise((resolve) => {
        document.addEventListener("DOMContentLoaded", () => {
            socket.onopen = () => {
                resolve();
            }
        })
    });

    readyPromise.then(() => {

        sendToSocket({
            "$type": "login",
            "username": "user1234",
            "password": "password1234"
        });
    })

    let messageProcessor = (event) => {
        let json = JSON.parse(event.data);
        switch (json.$type) {
            case 'login_successful':
                loginSuccessfulProcessor();

                break;
            case 'table_list':
                tableListProcessor(json.tables);
                break;
            case 'table_removed':
                tableRemovedProcessor(json.id);
                break;
            case 'table_added':
                tableAddProcessor(json.after_id, json.table);
                break;
            case 'table_updated':
                tableUpdateProcessor(json.id, json.table);
                break;

            default:
                break;
        }
    }

    let loginSuccessfulProcessor = () => {
        sendToSocket({
            "$type": "subscribe_tables"
        });
    }

    let tableListProcessor = (newTables) => {
        tables = newTables;
        listRenderer(newTables);
    }

    let tableRemovedProcessor = (id) => {
        let index = tables.findIndex(x => x.id === id);
        if (index > -1) {
            tables.splice(index, 1);
        }
        removeRenderer(id);
    }

    let tableAddProcessor = (afterId, newTable) => {
        let index = tables.findIndex(x => x.id === afterId);
        tables.splice(index + 1, 0, newTable);
        addRenderer(afterId, newTable);
    }

    let tableUpdateProcessor = (id, newTable) => {
        let index = tables.findIndex(x => x.id === id);
        tables[index] = newTable;
        updateRenderer(id, newTable);
    }

    let listRenderer = (tables) => {
        let tableContainer = document.getElementById("tablesContainer");
        let result = ""
        tables.forEach(function(table) {
            result += createTableHTML(table);
        }, this);
        tableContainer.innerHTML = result;
    }

    let removeRenderer = (id) => {
        document.getElementById(`tbl_${id}`).remove();
    }

    let addRenderer = (afterId, newTable) => {
        let newElement = document.createElement('div');
        newElement.id = `tbl_${newTable.id}`;
        newElement.innerHTML = createTableInnerHTML(newTable);
        let afterElement = document.getElementById(`tbl_${afterId}`);
        insertAfter(newElement, afterElement);
    }

    let updateRenderer = (id, table) =>{
        document.getElementById(`tbl_${id}`).innerHTML = createTableInnerHTML(table);
    }

    let createTableHTML = (table) => {
        let innerHTML = createTableInnerHTML(table);
        return `
            <div id="tbl_${table.id}">
                ${innerHTML}
            </div>`;
    }

    let createTableInnerHTML = (table) => {
        return `<p>${table.name}</p>
                <span>${table.participants} / 12</span>`
    }

    /**
     * inserts elementToAdd after target element
     * @param {*} elementToAdd 
     * @param {*} targetElement 
     */
    function insertAfter(elementToAdd, targetElement) {
        return targetElement.parentNode.insertBefore(elementToAdd, targetElement.nextSibling);
    }


    socket.onmessage = messageProcessor;

    myFunc = updateRenderer;
}

scopeFunc();


var myFunc;