export default function GroupsPage() {
  return (
    <section>
      <header className="page-head">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">Share expenses and settle up with the people you spend with</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm">Create Group</button>
      </header>
      <div className="card page-placeholder">
        Build expense split, settlements, real-time chat, and group alerts here.
      </div>
    </section>
  );
}
