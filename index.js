const Pool = require("pg").Pool;


const pool = new Pool({
  host: "localhost",
  user: "susanamunoz",
  database: "vespertino",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.connect();

async function crear(nombre, deposito) {
    await pool.query("BEGIN");
    try{

        let id;
        let resultado = await pool.query("Select id from usuario where name =$1",[nombre]);
        if (resultado.rowCount) {
            id= resultado.rows[0].id;
        }else{
            const resultado3 = await pool.query("insert into usuario (name) values ($1) RETURNING *", [nombre]);
            id= resultado3.rows[0].id; 
        }
        const resultado2 = await pool.query("select id from cuenta where user_id = $1",[id]);
        if(resultado2.rowCount){
            await pool.query("update cuenta set saldo = (saldo + $1) where id = $2",[deposito, resultado2.rows[0].id])
        }else{
            await pool.query("insert into cuenta (user_id,saldo) values($1,$2) ", [id, deposito])
        }

        const resultado4 = await pool.query("select * from cuenta where user_id2 = $1",[id]);
        console.table(resultado4.rows);
        await pool.query("COMMIT");
    }catch(e){
        await pool.query("ROLLBACK");
        console.log(e)
    }
}
crear("Federico6", 10000)
