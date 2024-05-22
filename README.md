# Readiness e Liveness
No contexto das aplicações atuais, é recomendado ter algum meio de verificar a saúde das mesmas, a fim de validar se elas estão aptas para realizar os processamentos necessários. Caso elas apresentem alguma falha, podemos atuar o mais breve possível.

Quando utilizamos o ambiente Kubernetes para executar nossas aplicações através de containers, nos temos uma opção de implementar essa verificação de maneira fácil e automatizar o processo de recuperação, utilizando para isso as features de `readinessprobe` e `livenessprobe` disponibilizadas pela própria API do Kubernetes.

Antes de implementar cada uma dessas features, primeiro é necessário entender o cenário de uso de cada uma:
- `Readiness`: é utilizada para checar se um container está apto para começar a receber as requests de processamento. Por padrão, assim que um container é criado, o Kubernetes entende que ela já pode receber as solicitações de processamento. No entanto, há cenários que é preciso aguardar algum processamento inicial no startup da aplicação para que somente após isso ela esteja totalmete apta para processar. Um exemplo disso pode ser a execução de migrations ou setup inicial de dados.
- `Liveness`: é utilizada para checar se um container ainda continua apto para receber as requests de processamento. Ou seja, um container pode ser iniciado corretamente, processar algumas solicitações por um determinado tempo e, por algum motivo, não ser mais capaz de executar os processamentos necessários. Um ponto importante aqui é, se caso essa validação falhar, o container será reiniciado a fim de tentar que o mesmo seja restabelecido. Exemplos de uso apra essa feature pode ser um deadlock na aplicação que impossibilita ela de receber novas requisições; pode ser usado para validar se as variáveis de ambiente ainda continuam com a última versão disponível (caso a definição das mesmas ocorra somente no Startup da aplicação).

## Implementação
Para este exemplo, foi implementada uma aplicação em NestJS, sendo integrada com um banco Postgres. A fim de simplificar o processo de validação, foi adicionada uma tabela `settings`, na qual contém apenas duas informações para simular se a aplicação está apta para ser iniciada e se a mesma continua apta. 

- Como interface de comunição com o banco de dados, foi utilizado o `TypeORM`. Com isso, a fim de definir a estrutura da tabela `settings`, foi criado a definição do [schema](https://github.com/martineli17/kubernetes-readiness-liveness/blob/master/api/src/infra/data/schemas/settings.schema.ts) da mesma. 
- Para buscar os dados relacionados ao `liveness` e ao `readiness`, foi implementado um [gateway](https://github.com/martineli17/kubernetes-readiness-liveness/blob/master/api/src/infra/data/gateways/settings.gateway.ts).
- Há dois endpoints, um para verificar o `readiness` e outro para verificar o `liveness` do container. Nestes endpoints, é feito uma busca no banco de dados para simular se a aplicação está apta ou não para realizar processamentos. [Arquivo](https://github.com/martineli17/kubernetes-readiness-liveness/blob/master/api/src/apresentation/controllers/health.controller.ts)
- Para configurar o `readiness` no arquivo do Kubernetes, foi necessário o seguinte trecho de código:
```yml
      readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3000
          initialDelaySeconds: 20
          periodSeconds: 10
          failureThreshold: 3
          successThreshold: 1
```
> Aqui é informado que a verificação irá ocorrer via requisição HTTP, no enpoint e porta especificados. A propriedade `initialDelaySeconds` define quanto tempo deve aguardar antes da primeira validação. A propriedade `periodSeconds` define qual é o período de validação. A propriedade `failureThreshold` define quantas vezes deve falhar antes de considerar o container como inválido. A propriedade `successThreshold` define quantas vezes deve ter sucesso antes de considerar o container como válido.

- Para configurar o `liveness` no arquivo do Kubernetes, foi necessário o seguinte trecho de código:
```yml
      livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 10
          failureThreshold: 3
          successThreshold: 1
```
> Aqui é informado que a verificação irá ocorrer via requisição HTTP, no enpoint e porta especificados. A propriedade `initialDelaySeconds` define quanto tempo deve aguardar antes da primeira validação. A propriedade `periodSeconds` define qual é o período de validação. A propriedade `failureThreshold` define quantas vezes deve falhar antes de considerar o container como inválido. A propriedade `successThreshold` define quantas vezes deve ter sucesso antes de considerar o container como válido.

## Build da aplicação
A aplicação conta com um Dockerfile. Sendo assim, para que seja possível utilizada no ambiente Kubernetes, pode ser realizado a criação de uma nova imagem através do seguinte comando: `docker build -t [NOME_DA_IMAGEM] .` . Para facilitar, vale executar tal comando no diretório do Dockerfile. 

Finalizando o build, pode ser feito o push para o Dockerhub através do seguinte comando: `docker push [NOME_DA_IMAGEM]`

Feito isso, no arquivo de [deployment](https://github.com/martineli17/kubernetes-readiness-liveness/blob/master/deployment.yml) do Kubernetes, é necessário informar qual o nome da imagem que foi definido no build acima, substituindo em `image: [NOME_DA_IMAGEM_GERADA]`. Além disso, é necessário alterar a vairável de ambiente responsável por definir o host do database, informando o IP do ambiente Kubernetes local (WSL): `name: DATABASE_HOST`.

## Executando a aplicação e validando o funcionamento
Para executar a aplicação, é necessário ter algum ambiente Kubernetes instalado na máquina.

Com isso, no diretório do arquivo `deployment.yml`, é necessário executar o comando: `kubectl apply -f deployment.yml`. Ao finalizar o comando, os pods criados podem ser visualizados através: `kubectl get pods`.

Agora, podemos alterar os dados no banco de dados para simular os comportamentos.
- Para adicionar os dados pela primeira vez:
```sql
insert into settings ("liveness", "readiness") values (false, false);
```
- Para alterar os dados de cada propriedade:
```sql
update settings set "liveness" = false, "readiness" = false;
```
###  Testando o `readiness como false` 
- Nota-se que o container não é defidamente criado com sucesso:

![image](https://github.com/martineli17/kubernetes-readiness-liveness/assets/50757499/73a509e6-2ba4-4b8a-a0e8-0e7966f3d20b)

### Modificando o `readiness como true`
> Nota-se que o container agora é criado com sucesso

![image](https://github.com/martineli17/kubernetes-readiness-liveness/assets/50757499/797a2733-f343-41d4-aaba-068cbe8b8770)


### Testando o `liveness como false` 
> Mesmo com o `readiness` como true, o container continua sendo reinicializado, pois a verificação do `liveness` falhou.

![image](https://github.com/martineli17/kubernetes-readiness-liveness/assets/50757499/8057c3ff-28a7-444e-80ad-9224872c4029)

### Modificando o `liveness como true`
> Agora com o `liveness` como true, a reinicialização do container não acontece mais. Parou na 5° reinicialização pois percebeu que o container está válido para continuar o processamento.

![image](https://github.com/martineli17/kubernetes-readiness-liveness/assets/50757499/b6b08438-37b1-40c3-9d3b-e017d9317c4e)
