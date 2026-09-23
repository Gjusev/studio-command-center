-- Asignar rol de studioleiter al usuario youhaghi@mokka-agentur.de
UPDATE studio_manager.users
SET role = 'studioleiter'
WHERE email = 'youhaghi@mokka-agentur.de';

-- Verificar el cambio
SELECT id, email, display_name, role
FROM studio_manager.users
WHERE email = 'youhaghi@mokka-agentur.de';
