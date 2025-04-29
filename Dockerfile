# Usando a imagem do KrakenD Enterprise
FROM krakend/krakend-ee:2.9 AS builder
# Copiar a configuração do KrakenD para o diretório correto
COPY krakend /etc/krakend

# Validar a configuração do KrakenD
RUN FC_DEBUG=true krakend check -d -t -c "krakend.json"

# Exportar o OpenAPI para gerar o swagger.json
RUN krakend openapi export -c /tmp/krakend.json -o /tmp/swagger.json

# Baixar o Swagger UI
FROM alpine as swagger
# Instalar git para clonar o repositório do Swagger UI
RUN apk add git
RUN git clone https://github.com/swagger-api/swagger-ui.git
# Substituir a URL demo com o caminho da sua API Swagger
RUN sed -i "s@https://petstore.swagger.io/v2/@/docs/@" swagger-ui/dist/swagger-initializer.js
# Mover o Swagger UI para o diretório correto
RUN mv swagger-ui/dist /docs

# Imagem final para a produção
FROM krakend/krakend-ee:2.9 AS production
# Copiar a licença do KrakenD
COPY krakend/LICENSE /etc/krakend/LICENSE
# Copiar a configuração final e a documentação gerada
COPY --from=builder /tmp/krakend.json /etc/krakend/krakend.json
COPY --from=swagger /docs /etc/krakend/docs/
COPY --from=builder /tmp/swagger.json /etc/krakend/docs/swagger.json
