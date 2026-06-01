// Pantalla que se muestra cuando todavía no se configuró la conexión
// con la base de datos (faltan las variables de entorno de Supabase).
export default function SetupNotice() {
  return (
    <div className="setup">
      <div className="setup__card card">
        <span className="setup__icono">🔌</span>
        <h1 className="setup__titulo">Falta conectar la base de datos</h1>
        <p className="setup__texto">
          Para que las ventas se compartan entre tus dispositivos, hay que conectar
          la app con tu base de datos de Supabase. Seguí estos pasos:
        </p>
        <ol className="setup__pasos">
          <li>Creá una cuenta gratis en <strong>supabase.com</strong> y un proyecto nuevo.</li>
          <li>En el <strong>SQL Editor</strong> pegá el contenido de <code>supabase/schema.sql</code> y dale <em>Run</em>.</li>
          <li>Copiá la <strong>Project URL</strong> y la <strong>anon key</strong> (en Project Settings → API).</li>
          <li>
            Pegalas en un archivo <code>.env.local</code> así:
            <pre className="setup__code">VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key</pre>
          </li>
          <li>Reiniciá el servidor (<code>npm run dev</code>).</li>
        </ol>
        <p className="setup__nota">
          💡 En Vercel, cargá esas mismas dos variables en
          <strong> Project Settings → Environment Variables</strong>.
        </p>
      </div>
    </div>
  )
}
