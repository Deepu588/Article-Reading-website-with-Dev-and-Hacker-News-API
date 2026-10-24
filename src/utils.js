export const formatDate = iso =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
