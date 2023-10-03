<h1 align="center">
  <p> 📑 Projeto de Arquitetura de Software - UFCG </p>
</h1>

## 📝 Objetivo

Realizar uma experimentação em um sistema simples em microsserviços que quando submetido a uma carga muito grande em um (ou mais) desses microsserviços replica-os e resolve o problema.

## ⚙️ Sistema

### 🔖 Descrição
O sistema se trata de um backend simples para uma plataforma de comércio eletrônico. Nele é utilizado o RabbitMQ, um sistema de mensagens, para facilitação da comunicação assíncrona entre alguns microsserviços que compõem a infraestrutura. Além disso, é feito uso do MongoDB como database e o Node.js para a estruturação da API, ao mesmo tempo em que empregam imagens Docker para cada componente do sistema.

O código fonte do sistema foi disponibilizado em um artigo do [Medium](https://medium.com), ele também tem uma descrição detalhada dele, para saber mais clique [aqui](https://medium.com/@nicholasgcc/building-scalable-e-commerce-backend-with-microservices-exploring-design-decisions-node-js-b5228080403b) e o repositório do código fonte pode ser encontrado [aqui](https://github.com/nicholas-gcc/nodejs-ecommerce-microservice).

O código fonte do sistema foi modificado para que fosse possível realizar os testes de sobrecarga.

### 📦 Arquitetura
![Arquitetura no Docker](/.github/assets/images/docker_architecture.png)

## 🪄 Experimentação

### Ferramentas
- [Docker](https://www.docker.com/get-started/) - Plataforma para desenvolvimento, deploy e execução de aplicações utilizando containers.
- [Kubernetes](https://kubernetes.io/) - Sistema de orquestração de containers.
- [Kind](https://kind.sigs.k8s.io/) - Ferramenta para criação de clusters Kubernetes locais.
- [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) - Ferramenta de linha de comando para interagir com o cluster Kubernetes.
- [Heml](https://helm.sh/docs/intro/install/) - Gerenciador de pacotes para Kubernetes.
- [Make](https://www.gnu.org/software/make/) - Ferramenta para automatizar a execução de tarefas.

### Preparação do ambiente

1. Primeiramente foi necessário analisar o sistema escolhido e realizar algumas modificações para que fosse possível realizar o teste de sobrecarga.

2. Com o sistema adaptado, foi necessário migrar toda a sua arquitetura para o Kubernetes pois o mesmo é uma ferramenta de orquestração de containers que permite a escalabilidade horizontal de microsserviços, o que é essencial para a realização do teste de sobrecarga.

3. Para facilitar a criação do cluster Kubernetes local foi utilizado o Kind, que é uma ferramenta que cria clusters Kubernetes usando containers Docker como nodes. Além disso, foi utilizado o Helm para gerenciar os pacotes do Kubernetes, o que facilitou a instalação do [kube-prometheus-stack](https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack), que é um pacote que contém o Prometheus, o Grafana e outros componentes necessários para o monitoramento da aplicação.

4. Diante disso, foi criado um Makefile para automatizar a execução de tarefas, como a criação do cluster Kubernetes, a instalação do kube-prometheus-stack, a construção das imagens Docker dos microsserviços, o load das imagens Docker no cluster Kubernetes e o deploy da aplicação.

### Deploy da aplicação no Kubernetes

1. Criar o cluster Kubernetes local:
    ```bash
    kind create cluster
    ```

2. Configurar o monitoramento da aplicação instalando o kube-prometheus-stack
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

6. Verificar se a aplicação e o monitoramento estão funcionando corretamente, todos os serviços devem estar com o status "Running":
    6.1 Verificando aplicação
    ```bash
    kubectl get pods
    ```
    6.2 Verificando o monitoramento
    ```bash
    kubectl get pods -n monitoring
    ```

7. Expor o api-gateway para acesso externo:
    ```bash
    make kube-expose-app
    ```

8. Expor o Grafana para acesso externo:
    ```bash
    make kube-expose-grafana
    ```






