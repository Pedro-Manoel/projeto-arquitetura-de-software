docker-build-all:
	docker build -t users-service system/users
	docker build -t products-service system/products
	docker build -t orders-service system/orders
	docker build -t api-gateway-service system/api-gateway

docker-delete-all:
	docker rmi -f users-service products-service orders-service api-gateway-service

kind-load-docker-images:
	kind load docker-image users-service
	kind load docker-image products-service
	kind load docker-image orders-service
	kind load docker-image api-gateway-service

add-prometheus-stack:
	kubectl create namespace monitoring 
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm repo update
	helm install prom prometheus-community/kube-prometheus-stack -n monitoring

remove-prometheus-stack:
	helm uninstall prom -n monitoring
	kubectl delete namespace monitoring	

kube-pods-monitoring:
	kubectl get pods -n monitoring

kube-up:
	kubectl apply -f k8s

kube-down:
	kubectl delete -f k8s

kube-expose-app:
	while true; do kubectl port-forward svc/api-gateway-service 3004:3004; done;

kube-expose-grafana:
	kubectl port-forward svc/prom-grafana 3000:80 -n monitoring

fortio-start:
	kubectl run --image=istio/fortio fortio -- load -qps 2000 -t 30m -c 200 "http://users-service:3001/users/health"

fortio-stop:
	kubectl delete pod fortio

k6-up:
	docker compose -f ./k6/docker-compose.yml up -d 

k6-down:
	docker compose -f ./k6/docker-compose.yml down -v

k6-run:
	k6 run k6/script.js --out influxdb=http://localhost:8086/k6
