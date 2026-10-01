const { createLead } = require('./src/lib/actions/crm');
// We cannot easily test Next.js server actions in node script this way because they depend on next/headers and session.
