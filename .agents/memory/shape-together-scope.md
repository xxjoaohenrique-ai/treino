---
name: Shape Together — escopo de importação
description: Restrições do usuário para importar e executar o aplicativo existente.
---

Importar o projeto existente Shape Together, preservando código, visual, funcionalidades e fluxo. Não recriar do zero nem alterar o design desnecessariamente. Manter a persistência no Supabase e a autenticação Google OAuth existentes, sem substituir o provedor.

**Why:** O usuário pediu explicitamente para fazer o projeto existente funcionar primeiro, com preview executável; publicação fica para depois.

**How to apply:** Em trabalhos de importação e configuração, usar o código original como base e manter credenciais privilegiadas fora do frontend.

Para o Google OAuth, manter distintos os dois retornos: o Google Cloud direciona ao callback do Supabase (`/auth/v1/callback`); a lista Redirect URLs do Supabase permite o callback do app (`/auth/callback`), e o Site URL deve ser a origem do preview. O usuário confirmou que o login funcionou com essa configuração.

**Why:** Os dois callbacks são fáceis de confundir, e a configuração foi validada pelo login bem-sucedido no preview.

**How to apply:** Ao configurar OAuth em outro ambiente, atualize a origem e o callback do app na URL Configuration do Supabase e cadastre o callback do Supabase como redirect URI do cliente OAuth no Google Cloud.

Em correções de autenticação e persistência, preservar todos os dados existentes no Supabase. Não executar SQL novo, alterar schema/RLS ou configurações do Google Cloud/OAuth, nem apagar, resetar, sobrescrever ou migrar dados destrutivamente. `localStorage` pode apoiar a interface, mas nunca ser a fonte definitiva do progresso.

**Why:** O usuário estabeleceu essas restrições para corrigir o app sem arriscar dados ou a configuração já funcional.

**How to apply:** Manter leituras e testes não destrutivos; usar o Supabase como fonte de verdade e interromper com erro explícito quando a persistência não estiver disponível.