const mysql = require('mysql');
const { mysql_host, mysql_port, mysql_user, mysql_pass, mysql_db } = require('../config.json');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: mysql_host,
    port: mysql_port,
    user: mysql_user,
    password: mysql_pass,
    database: mysql_db
});

const queryPromise = (query, params) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, results, fields) => {
            if (error) {
                console.error("Database error:", error);
                reject(error);
            }
            resolve(results);
        });
    });
};

const insert = async (table, fields, values) => {
    try {
        const result = await queryPromise(`INSERT INTO \`${table}\` (${fields}) VALUES (?)`, [values]);
        return { result: "success" };
    } catch (error) {
        return { result: "error", type: "Database error" };
    }
};

const search = async (table, field, query) => {
    try {
        const result = await queryPromise(`SELECT * FROM \`${table}\` WHERE \`${field}\` = ?`, [query]);
        return result[0];
    } catch (error) {
        console.error("Search error:", error);
        return null;
    }
};

const searchAll = async (table, fields, queries) => {
    try {
        let query = `SELECT * FROM \`${table}\` WHERE `;
        const params = [];
        for (let i = 0; i < fields.length; i++) {
            query += `\`${fields[i]}\` = ?`;
            params.push(queries[i]);
            if (i !== fields.length - 1) {
                query += ' AND ';
            }
        }
        const result = await queryPromise(query, params);
        return result;
    } catch (error) {
        console.error("Search error:", error);
        return null;
    }
};

const update = async (table, field, value, search, query) => {
    try {
        await queryPromise(`UPDATE \`${table}\` SET \`${field}\` = ? WHERE \`${search}\` = ?`, [value, query]);
        return { result: "success" };
    } catch (error) {
        return { result: "error", type: "Database error" };
    }
};

const deleteFrom = async (table, fields, queries) => {
    try {
        let query = `DELETE FROM \`${table}\` WHERE `;
        const params = [];
        for (let i = 0; i < fields.length; i++) {
            query += `\`${fields[i]}\` = ?`;
            params.push(queries[i]);
            if (i !== fields.length - 1) {
                query += ' AND ';
            }
        }
        await queryPromise(query, params);
        return { result: "success" };
    } catch (error) {
        return { result: "error", type: "Database error" };
    }
};

const searchExists = async (table, field, query) => {
    try {
        const result = await queryPromise(`SELECT * FROM \`${table}\` WHERE \`${field}\` = ?`, [query]);
        return result.length > 0;
    } catch (error) {
        console.error("Search exists error:", error);
        return false;
    }
};

module.exports = {
    insert,
    search,
    searchAll,
    update,
    deleteFrom,
    searchExists
};
