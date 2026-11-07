export function Cargando(){return <div className="tarjeta">Cargando información…</div>}
export function Vacio({texto}:{texto:string}){return <div className="tarjeta muted">{texto}</div>}
export function ErrorApi({error}:{error:unknown}){const mensaje=error instanceof Error?error.message:'Ocurrió un error';return <p className="error">{mensaje}</p>}
