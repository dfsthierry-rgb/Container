export interface Lancamento {
  _idx?: number; // Used for frontend editing
  tipo_container: string;
  data_desembaraco: string;
  ref_montreal: string;
  invoices: string;
  data_embarque: string;
  exportadores: string;
  data_chegada: string;
  procedencia: string;
  navio: string;
  tipo_carga: string;
  armador: string;
  local_embarque: string;
  local_nacionalizacao: string;
  di: string;
  incoterm: string;
  data_registro: string;
  cambio: number | string;
  fob_usd: number | string;
  frete: number | string;
  seguro: number | string;
  acrescimos: number | string;
  capatazia: number | string;
  ii: number | string;
  ipi: number | string;
  pis: number | string;
  cofins: number | string;
  icms: number | string;
  multa: number | string;
  afrmm: number | string;
  siscomex: number | string;
  outras_da: number | string;
  armazenagem: number | string;
  desconsolidacao: number | string;
  transp_interno: number | string;
  liberacao: number | string;
  hon_sda: number | string;
  prest_serv: number | string;
  desp_div: number | string;
  timestamp: string;
}

export const HEADERS = [
  'tipo_container','data_desembaraco','ref_montreal','invoices','data_embarque','exportadores',
  'data_chegada','procedencia','navio','tipo_carga','armador','local_embarque','local_nacionalizacao',
  'di','incoterm','data_registro','cambio','fob_usd','frete','seguro','acrescimos','capatazia',
  'ii','ipi','pis','cofins','icms','multa','afrmm','siscomex','outras_da','armazenagem',
  'desconsolidacao','transp_interno','liberacao','hon_sda','prest_serv','desp_div','timestamp'
];

export const NUMERIC_FIELDS = [
  'cambio','fob_usd','frete','seguro','acrescimos','capatazia',
  'ii','ipi','pis','cofins','icms','multa','afrmm','siscomex','outras_da','armazenagem',
  'desconsolidacao','transp_interno','liberacao','hon_sda','prest_serv','desp_div'
];

export const DATE_FIELDS = ['data_desembaraco','data_embarque','data_chegada','data_registro'];
