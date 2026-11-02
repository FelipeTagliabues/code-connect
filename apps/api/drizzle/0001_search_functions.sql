-- Colunas geradas só aceitam funções IMMUTABLE. translate() remove os acentos sem depender da extensão unaccent, e array_to_string() é STABLE, por isso o wrapper.
CREATE FUNCTION normalize_search(input text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT translate(
    input,
    'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
  )
$$;
--> statement-breakpoint
CREATE FUNCTION tags_to_text(tags text[]) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT array_to_string(tags, ' ')
$$;
