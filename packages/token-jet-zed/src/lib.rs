use zed_extension_api::{self as zed, LanguageServerId, Result};

struct TokenJet;

impl zed::Extension for TokenJet {
    fn new() -> Self {
        TokenJet
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let node = worktree
            .which("node")
            .ok_or_else(|| "node is not on PATH; token-jet-lsp runs on Node 22.18 or later".to_string())?;
        let server = format!("{}/node_modules/token-jet-lsp/dist/server.js", worktree.root_path());
        Ok(zed::Command {
            command: node,
            args: vec![server, "--stdio".to_string()],
            env: worktree.shell_env(),
        })
    }
}

zed::register_extension!(TokenJet);
