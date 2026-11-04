<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Accounts use name+password only: the name maps to a synthetic email via `usernameToEmail` in src/lib/game.ts (auto-confirm on) — never ask for a real email.
- Multiplayer is peer-to-peer over Realtime broadcast/presence (`lobby` channel for invites, `room:<code>` per match); each phone simulates its own player, the inviter (QIFIL) decides level completion — no server game state.
- Game screen lives in src/components/Game.tsx (shared by online /play and offline /solo); solo mode uses the BOT in src/lib/bot.ts and skips Realtime so it works without login or internet.
