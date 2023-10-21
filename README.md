<h1 align="center">
  <p> 📑 Projeto de Arquitetura de Software - UFCG </p>
</h1>

## 📝 Objetivo

Realizar uma experimentação em um sistema simples em microsserviços que quando submetido a uma carga muito grande em um (ou mais) desses microsserviços replica-os e resolve o problema.

## ⚙️ Sistema

### 🔖 Descrição
O sistema se trata de um backend simples para uma plataforma de comércio eletrônico. Nele é utilizado o RabbitMQ, um sistema de mensagens, para facilitação da comunicação assíncrona entre alguns microsserviços que compõem a infraestrutura. Além disso, é feito uso do MongoDB como database e o Node.js para a estruturação da API, ao mesmo tempo em que empregam imagens Docker para cada componente do sistema.

O código fonte do sistema foi disponibilizado em um artigo do [Medium](https://medium.com), ele também tem uma descrição detalhada dele, para saber mais clique [aqui](https://medium.com/@nicholasgcc/building-scalable-e-commerce-backend-with-microservices-exploring-design-decisions-node-js-b5228080403b). O repositório do código fonte pode ser encontrado [aqui](https://github.com/nicholas-gcc/nodejs-ecommerce-microservice).

O código fonte do sistema foi modificado para que fosse possível realizar os testes de sobrecarga.

### 📦 Arquitetura
![Arquitetura no Docker](/.github/assets/images/docker_architecture.png)

## 🪄 Experimentação

### Ferramentas utilizadas
- [Docker](https://www.docker.com/get-started/) - Plataforma para desenvolvimento, deploy e execução de aplicações utilizando containers.
- [Kubernetes](https://kubernetes.io/) - Sistema de orquestração de containers.
- [Kind](https://kind.sigs.k8s.io/) - Ferramenta para criação de clusters Kubernetes locais.
- [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) - Ferramenta de linha de comando para interagir com o cluster Kubernetes.
- [Heml](https://helm.sh/docs/intro/install/) - Gerenciador de pacotes para Kubernetes.
- [Make](https://www.gnu.org/software/make/) - Ferramenta para automatizar a execução de tarefas.
- [k6](https://k6.io/) - Ferramenta para testes de carga.


### Deploy da aplicação no Kubernetes

1. Criar o cluster Kubernetes local:
    ```bash
    kind create cluster
    ```

2. Configurar o monitoramento da aplicação instalando o [kube-prometheus-stack](https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack):
    ```bash
    make add-prometheus-stack
    ```

3. Construir as imagens Docker dos microsserviços:
    ```bash
    make docker-build-all
    ```

4. Fazer o load das imagens Docker no cluster Kubernetes (Processo demorado):
    ```bash
    make kind-load-docker-images
    ```

5. Realizar o deploy da aplicação:
    ```bash
    make kube-up
    ```

6. Verificar se a aplicação e o monitoramento estão funcionando corretamente, todos os serviços devem estar com o status `Running`:
    6.1 Verificando aplicação
    ```bash
    kubectl get pods
    ```
    6.2 Verificando o monitoramento
    ```bash
    kubectl get pods -n monitoring
    ```

### Preparação do teste de carga

1. Levantar o ambiente para a execução:
    ```bash
    make k6-up
    ```

### Realizar o experimento
1. Expor o api-gateway para acesso externo:
    ```bash
    make kube-expose-app
    ```

2. Expor o Grafana do Kubernetes para acesso externo:
    ```bash
    make kube-expose-grafana
    ```

3. Importar o dashboard do Kubernetes no grafana:
    2.1 Acessar o [grafana do Kubernetes](http://localhost:3000)
    2.2 Importar o dashboard [Kubernetes Horizontal Pod Autoscaler](./grafana/dashboards/Kubernetes_Horizontal_Pod_Autoscaler.json)


4. Importar o dashboard do K6 no grafana:
    4.1 Acessar o [grafana do K6](http://localhost:3001)
    4.1 Configurar a conexão com o InfluxDB:
        * URL: `http://influxdb:8086`
        * Database: `k6`
    4.2 Importar o dashboard [k6 Load Testing Results](./grafana/dashboards/k6_Load_Testing_Results.json)
        

5. Iniciar o teste de carga:
    ```bash
    make k6-run
    ```
6. Acompanhar o dashboard do K6 e do Kubernetes para verificar o comportamento da aplicação e os resultados do teste.

7. Ao finalizar o teste de carga devemos:
    7.1 Derrubar o ambiente de execução do K6:
    ```bash
    make k6-down
    ```
    7.2 Derrubar o ambiente de execução da aplicação:
    ```bash
    make kube-down
    ```







