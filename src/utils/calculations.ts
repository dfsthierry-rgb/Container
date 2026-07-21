import { Lancamento } from '../types';
import { parseNum } from './numberUtils';
import { makeDate } from './dateUtils';

export function computeLanc(l: Lancamento) {
    const n = (k: keyof Lancamento) => parseNum(l[k]);
    const cambio = n('cambio');
    const fob_usd = n('fob_usd');
    const fob_real = fob_usd * cambio;
    const frete = n('frete');
    const seguro = n('seguro');
    const acrescimos = n('acrescimos');
    const cif = fob_real + frete + seguro;
    
    const capatazia = n('capatazia');
    const valor_aduaneiro = cif + capatazia;

    const ii = n('ii');
    const ipi = n('ipi');
    const pis = n('pis');
    const cofins = n('cofins');
    const icms = n('icms');
    const multa = n('multa');
    const afrmm = n('afrmm');
    const siscomex = n('siscomex');
    const outras_da = n('outras_da');
    const armazenagem = n('armazenagem');
    const desconsolidacao = n('desconsolidacao');
    const transp_interno = n('transp_interno');
    const liberacao = n('liberacao');
    const hon_sda = n('hon_sda');
    const prest_serv = n('prest_serv');
    const desp_div = n('desp_div');

    const logistica = frete + seguro + acrescimos;
    const tributos = ii + ipi + pis + cofins + icms;
    const desp_adu = afrmm + siscomex + outras_da + armazenagem + desconsolidacao + transp_interno + liberacao;
    const despachante = hon_sda + prest_serv + desp_div;
    const total = cif + ii + ipi + pis + cofins + icms + multa + afrmm + siscomex + outras_da + armazenagem + desconsolidacao + transp_interno + liberacao + hon_sda + prest_serv + desp_div;
    const fator = fob_real > 0 ? total / fob_real : 0;

    let diasEC = 0, diasCD = 0, diasED = 0;
    const dEmb = makeDate(l.data_embarque);
    const dCheg = makeDate(l.data_chegada);
    const dDesemb = makeDate(l.data_desembaraco);
    if (dEmb && dCheg) diasEC = Math.floor((dCheg.getTime() - dEmb.getTime()) / 86400000);
    if (dCheg && dDesemb) diasCD = Math.floor((dDesemb.getTime() - dCheg.getTime()) / 86400000);
    if (dEmb && dDesemb) diasED = Math.floor((dDesemb.getTime() - dEmb.getTime()) / 86400000);

    return { fob_real, cif, valor_aduaneiro, logistica, tributos, desp_adu, despachante, total, fator, diasEC, diasCD, diasED };
}
