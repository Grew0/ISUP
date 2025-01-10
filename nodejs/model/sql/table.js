const SQL = require("./sql");

class JoinedTables {
    joines = [];
    aliases = [];

    constructor(table) {
        this.join(table);
    }

    join(table) {  // on = {column: my_column, table: table_name, , tcolumn: column of other table}
        return this.join_on(table, null, null, null);
    }

    join_on(table, join_column, on_table, on_column) {
        this.joines.push({
            table: table.table_name,
            join_column: join_column,
            on_table: on_table?.table_name,
            on_column: on_column
        });
        return this;
    }

    add_alias(table, column, alias) {
        this.aliases.push({
            table: table.table_name,
            column: column,
            alias: alias
        });
        return this;
    }

    read(where) {
        return new Promise((resolve, reject) => {
            let q = ["select"]
            let q2 = ["from"];
            for (let i in this.joines) {
                let t = this.joines[i];
                if (i != 0) {
                    q.push(",");
                    q2.push("join");
                }
                q.push(t.table + ".*");
                q2.push(t.table);
                if (t.join_column && t.on_table && t.on_column) {
                    q2.push("on", t.table + "." + t.join_column, "=",
                        t.on_table + "." + t.on_column);
                }
            }

            for (let i in this.aliases) {
                let t = this.aliases[i];
                q.push(",", t.table + "." + t.column, "as", t.alias);
            }

            let where_str = Table.where(where);
            if (where_str != "") q2.push("where", where_str);            
            SQL.simple(q.concat(q2).join(" "), resolve, reject);
        });
    }
}
class Table {
    table_name = ""

    static reform(x) { return typeof (x) == "string" ? `"${Table.rm_wrong(x)}"` : x; }

    static rm_wrong(str) {
        str = str.replaceAll("\"", "\\\"");
        str = str.replaceAll("\'", "\\\'");
        return str;
    }

    static rm_nulls(dict = {}) {
        let ans = {};
        for (let i in dict) {
            if (dict[i] != null)
                ans[i] = dict[i];
        }
        return ans;
    }

    constructor(table_name) {
        this.table_name = table_name;
    }

    static to_arr(entry = {}) {
        entry = Table.rm_nulls(entry);
        if (entry == null || Object.keys(entry).length == 0) return [];
        return Object.keys(entry).map(i => `${i} = ${Table.reform(entry[i])}`);
    }

    static where(entry = {}) {
        return Table.to_arr(entry).join(" AND ");
    }

    create(entry, func = null, error = null) {
        entry = Table.rm_nulls(entry);
        let values = Object.values(entry).map(Table.reform);
        SQL.simple(`INSERT INTO ${this.table_name}(${Object.keys(entry).join(", ")
            })VALUES(${values.join(', ')})`, func, error);
    }

    read(func, where = null, error = null) {
        let where_str = Table.where(where);
        if (where_str != "") where_str = " WHERE " + where_str;
        SQL.simple(`select * from ${this.table_name} ${where_str}`, func, error);
    }

    read_where_SQL(func, where_SQL = "", error = null) {
        if (where_SQL) where_SQL = `where ${where_SQL}`;
        else where_SQL = "";
        SQL.simple(`select * from ${this.table_name} ${where_SQL}`, func, error);
    }

    update(where, entry, lambda = null, error = null) {
        let e = Table.rm_nulls(entry);
        SQL.simple(`update ${this.table_name} set ${Table.to_arr(e).join(", ")} ` +
            `where ${Table.where(where)}`, lambda || (_ => { }), error);
    }

    update_where_SQL(where_SQL, entry, func = null, error = null) {
        if (where_SQL) where_SQL = `where ${where_SQL}`;
        else where_SQL = "";
        let e = Table.rm_nulls(entry);
        SQL.simple(`update ${this.table_name} set ${Table.to_arr(e).join(", ")} ` +
            ` ${where_SQL}`, func, error);
    }

    delete(where, lambda = null, error = null) {
        SQL.simple(`delete from ${this.table_name} where ${Table.where(where)}`, lambda, error);
    }

    join(table) {
        return new JoinedTables(this).join(table);
    }

    join_on(table, join_column, on_column) {
        return new JoinedTables(this).join_on(table, join_column, this, on_column);
    }
}

module.exports = Table;