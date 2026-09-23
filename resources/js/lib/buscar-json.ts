/** GET JSON na mesma origem (cookie de sessão vai junto). */
export async function buscarJson<T>(url: string): Promise<T> {
    const resposta = await fetch(url, {
        headers: { Accept: 'application/json' },
    });

    if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => null)) as {
            message?: string;
        } | null;

        throw new Error(corpo?.message ?? `Erro ${resposta.status}`);
    }

    return (await resposta.json()) as T;
}
