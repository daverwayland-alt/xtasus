import GameClient from './GameClient';

export default async function GamePage({ params }) {
    const { id } = await params;
    return <GameClient gameId={id.toUpperCase()} />;
}
