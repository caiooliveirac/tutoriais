import type { ConfigMapas } from '@/types';
import { MapaGoogle } from './mapa-google';
import { MapaOsm } from './mapa-osm';
import type { PropsMapa } from './tipos';

export function MapaAtendimento({
    config,
    ...props
}: PropsMapa & { config: ConfigMapas }) {
    return config.provedor === 'google' && config.chave_navegador ? (
        <MapaGoogle chave={config.chave_navegador} {...props} />
    ) : (
        <MapaOsm {...props} />
    );
}
