# Master Prompt: Complete Autonomous Vertex System Build
*One-Shot End-to-End System Generation with Asynchronous Parallelism*

```markdown
## Task Overview:
**Objective:** Build complete Autonomous Vertex Marketing System from scratch with closed-loop testing between stages
**Complexity:** High
**Context:** Starting with bare GrooveFunnels/Courses.gg, generate all infrastructure, code, configs, and documentation in one execution
**Budget:** $100/month operational constraint
**Output:** Master ZIP file with complete working system + documentation

## Tools & Actions:
- **RunCode:**
```yaml
function: RunCode
code: |
  # MASTER SYSTEM BUILDER
  # Generates complete infrastructure with parallel execution
  import asyncio
  import json
  import yaml
  import zipfile
  import os
  from pathlib import Path
  
  async def build_complete_system():
      # Create master directory structure
      base_dir = Path("autonomous-vertex-system")
      
      # Parallel infrastructure generation
      results = await asyncio.gather(
          generate_infrastructure_configs(),
          generate_automation_workflows(),
          generate_ai_configurations(),
          generate_revenue_systems(),
          generate_monitoring_stack(),
          generate_documentation()
      )
      
      # Closed-loop testing between stages
      test_results = await test_integration_points(results)
      
      # Generate master zip file
      create_deployment_package(base_dir, results, test_results)
      
      return {
          "status": "complete",
          "tests": test_results,
          "deployment_ready": True
      }
```

- **DeepResearch:**
```yaml
function: DeepResearch
queries: [
  "DigitalOcean Kubernetes 2GB optimization 2025",
  "n8n LangChain AI workflows examples",
  "Postal SMTP server high volume configuration",
  "Apache AGE graph queries for marketing"
]
parallel: true
```

- **ScheduleTask:**
```yaml
function: ScheduleTask
name: "system_build_progress"
tasks: [
  {"name": "infrastructure_deploy", "timeout": 300},
  {"name": "integration_test", "timeout": 180},
  {"name": "performance_benchmark", "timeout": 120}
]
```

## Constraints:
- **Model Routing:** auto (let RouteLLM optimize)
- **Token Limit:** ≤ 10000 tokens (one-shot generation)
- **Cost Threshold:** 70% weak model, 30% strong model
- **Output Format:** ZIP file with complete system
- **Parallel Threads:** Maximum 8 concurrent operations
- **Testing:** Closed-loop verification at each stage

## Master Build Pipeline:

### 🔧 STAGE 0: Project Initialization (Parallel Threads 1-3)
```python
async def stage_0_initialization():
    """Initialize project structure and dependencies"""
    
    # Thread 1: Directory Structure
    directories = await create_directory_tree({
        "infrastructure/": ["docker/", "kubernetes/", "terraform/"],
        "automation/": ["n8n/", "workflows/", "templates/"],
        "ai/": ["models/", "prompts/", "training/"],
        "revenue/": ["funnels/", "products/", "analytics/"],
        "monitoring/": ["grafana/", "prometheus/", "alerts/"],
        "docs/": ["setup/", "api/", "operations/"]
    })
    
    # Thread 2: Dependency Management
    dependencies = await generate_dependency_files({
        "requirements.txt": python_deps,
        "package.json": node_deps,
        "Gemfile": ruby_deps,
        "go.mod": go_deps
    })
    
    # Thread 3: Environment Configuration
    env_configs = await create_environment_configs({
        ".env.example": template_vars,
        ".env.development": dev_vars,
        ".env.production": prod_vars,
        "secrets/": encrypted_secrets
    })
    
    return await validate_initialization(directories, dependencies, env_configs)
```

### 🏗️ STAGE 1: Infrastructure Deployment (Parallel Threads 4-8)
```python
async def stage_1_infrastructure():
    """Deploy complete infrastructure stack"""
    
    # Thread 4: Container Orchestration
    docker_configs = await asyncio.gather(
        generate_dockerfile("postgres-age", postgres_age_config),
        generate_dockerfile("n8n", n8n_config),
        generate_dockerfile("postal", postal_config),
        generate_dockerfile("chatwoot", chatwoot_config),
        generate_dockerfile("redis", redis_config),
        generate_docker_compose(all_services)
    )
    
    # Thread 5: Kubernetes Manifests
    k8s_configs = await asyncio.gather(
        create_deployments(service_specs),
        create_services(network_configs),
        create_ingress(domain_routing),
        create_configmaps(app_configs),
        create_secrets(sensitive_data),
        create_hpa(autoscaling_rules)
    )
    
    # Thread 6: Database Schema
    db_configs = await asyncio.gather(
        create_postgres_schema(),
        install_apache_age_extension(),
        create_graph_indexes(),
        seed_initial_data()
    )
    
    # Thread 7: Network Security
    security_configs = await asyncio.gather(
        configure_firewall_rules(),
        setup_ssl_certificates(),
        create_oauth_configs(),
        implement_2fauth_api()
    )
    
    # Thread 8: Storage Configuration
    storage_configs = await asyncio.gather(
        setup_minio_buckets(),
        configure_redis_persistence(),
        create_backup_policies()
    )
    
    # Closed-loop testing
    return await test_infrastructure_integration(
        docker_configs, k8s_configs, db_configs, 
        security_configs, storage_configs
    )
```

### ⚙️ STAGE 2: Automation & Workflows (Parallel Execution)
```python
async def stage_2_automation():
    """Configure all automation workflows"""
    
    workflows = await asyncio.gather(
        # Market Analysis Bot Workflows
        create_n8n_workflow({
            "name": "market_analyzer",
            "triggers": ["schedule", "webhook"],
            "nodes": [
                spider_cloud_scraper,
                webthink_analyzer,
                apache_age_pattern_matcher,
                opportunity_scorer
            ],
            "outputs": ["profitable_niches", "competitor_gaps"]
        }),
        
        # Content Creation Bot Workflows
        create_n8n_workflow({
            "name": "content_generator",
            "triggers": ["market_signal", "schedule"],
            "nodes": [
                mistral_7b_generator,
                ghost_cms_publisher,
                seo_optimizer,
                social_distributor
            ],
            "outputs": ["published_content", "engagement_metrics"]
        }),
        
        # Customer Success Bot Workflows
        create_n8n_workflow({
            "name": "customer_support",
            "triggers": ["chatwoot_message", "email"],
            "nodes": [
                ai_intent_classifier,
                knowledge_base_search,
                response_generator,
                escalation_handler
            ],
            "outputs": ["resolved_tickets", "satisfaction_scores"]
        }),
        
        # Revenue Optimization Workflows
        create_n8n_workflow({
            "name": "revenue_optimizer",
            "triggers": ["conversion_event", "daily_schedule"],
            "nodes": [
                price_elasticity_analyzer,
                ab_test_controller,
                upsell_trigger,
                profit_calculator
            ],
            "outputs": ["optimized_prices", "revenue_metrics"]
        }),
        
        # System Monitoring Workflows
        create_n8n_workflow({
            "name": "system_monitor",
            "triggers": ["error_webhook", "performance_alert"],
            "nodes": [
                log_aggregator,
                anomaly_detector,
                auto_scaler,
                alert_dispatcher
            ],
            "outputs": ["system_health", "scaling_actions"]
        })
    )
    
    # Integration testing with Stage 1
    return await test_workflow_integration(workflows, stage_1_results)
```

### 🤖 STAGE 3: AI Model Deployment (Parallel AI Setup)
```python
async def stage_3_ai_deployment():
    """Deploy and configure AI models"""
    
    ai_stack = await asyncio.gather(
        # Mistral-7B Deployment
        deploy_llm_model({
            "model": "mistral-7b-instruct",
            "quantization": "4bit",
            "gpu_layers": 24,
            "context_window": 4096,
            "api_endpoint": "/v1/completions"
        }),
        
        # Prompt Template Library
        create_prompt_templates({
            "market_analysis": market_analysis_prompt,
            "content_generation": content_creation_prompt,
            "customer_response": support_response_prompt,
            "price_optimization": pricing_strategy_prompt
        }),
        
        # Vector Database Setup
        configure_vector_store({
            "type": "pgvector",
            "dimensions": 768,
            "indexes": ["product_embeddings", "customer_embeddings"]
        }),
        
        # Training Pipeline
        setup_training_pipeline({
            "data_sources": ["customer_interactions", "market_data"],
            "fine_tuning_schedule": "weekly",
            "evaluation_metrics": ["perplexity", "response_quality"]
        })
    )
    
    # Test AI integration with workflows
    return await test_ai_integration(ai_stack, stage_2_results)
```

### 💰 STAGE 4: Revenue Systems (Parallel Revenue Streams)
```python
async def stage_4_revenue_systems():
    """Configure all revenue generation systems"""
    
    revenue_stack = await asyncio.gather(
        # Payment Processing
        setup_payment_system({
            "primary": "stripe",
            "fallback": "groovesell",
            "currencies": ["USD", "EUR", "GBP"],
            "webhook_endpoints": ["/payments/webhook"]
        }),
        
        # Product Configuration
        create_product_catalog({
            "courses": course_products,
            "consultations": booking_products,
            "memberships": recurring_products,
            "upsells": upsell_chains
        }),
        
        # Funnel Builder
        generate_sales_funnels({
            "landing_pages": ghost_templates,
            "checkout_flows": optimized_checkouts,
            "email_sequences": mautic_campaigns,
            "retargeting": pixel_configs
        }),
        
        # Analytics Setup
        configure_analytics({
            "plausible": privacy_analytics,
            "custom_events": conversion_tracking,
            "revenue_attribution": multi_touch_attribution,
            "dashboards": grafana_revenue_dashboard
        })
    )
    
    # Test complete revenue flow
    return await test_revenue_integration(revenue_stack, all_previous_stages)
```

### 🚀 STAGE 5: Autonomous Activation (Final Assembly)
```python
async def stage_5_autonomous_activation():
    """Activate fully autonomous operations"""
    
    activation = await asyncio.gather(
        # Scheduler Configuration
        setup_schedulers({
            "market_scan": "0 */2 * * *",
            "content_generation": "0 8,14,20 * * *",
            "price_optimization": "0 3 * * *",
            "profit_extraction": "0 0 * * MON"
        }),
        
        # Monitoring Dashboard
        create_master_dashboard({
            "revenue_metrics": real_time_revenue,
            "system_health": infrastructure_status,
            "bot_performance": automation_metrics,
            "growth_projections": ml_forecasts
        }),
        
        # Failover Systems
        implement_failovers({
            "infrastructure": backup_regions,
            "payments": alternative_processors,
            "ai_models": api_fallbacks,
            "data": replication_policies
        }),
        
        # Documentation Generation
        generate_documentation({
            "user_manual": operator_guide,
            "api_reference": endpoint_docs,
            "troubleshooting": common_issues,
            "architecture": system_diagrams
        })
    )
    
    return await final_system_validation(all_stages)
```

### 📦 FINAL: Package Generation
```python
async def create_deployment_package():
    """Generate master ZIP with all components"""
    
    # Create file tree
    file_tree = generate_file_tree_markdown()
    
    # Package structure
    package_contents = {
        "README.md": master_readme,
        "FILE_TREE.md": file_tree,
        "docker-compose.yml": production_compose,
        "kubernetes/": all_k8s_manifests,
        "scripts/": {
            "deploy.sh": one_click_deploy,
            "test.sh": integration_tests,
            "backup.sh": backup_script
        },
        "configs/": all_configurations,
        "workflows/": n8n_exports,
        "documentation/": {
            "setup_guide.md": step_by_step_setup,
            "architecture.md": system_design,
            "operations.md": daily_operations,
            "scaling.md": growth_guide
        }
    }
    
    # Create ZIP file
    create_zip_archive("autonomous-vertex-system.zip", package_contents)
    
    return {
        "package": "autonomous-vertex-system.zip",
        "size": calculate_size(),
        "components": count_components(),
        "ready_to_deploy": True
    }
```

## Closed-Loop Testing Protocol:
```yaml
test_stages:
  - name: "Infrastructure Validation"
    tests: ["connectivity", "performance", "security"]
    
  - name: "Workflow Integration"
    tests: ["data_flow", "error_handling", "performance"]
    
  - name: "AI Model Performance"
    tests: ["inference_speed", "accuracy", "resource_usage"]
    
  - name: "Revenue Flow"
    tests: ["payment_processing", "conversion_tracking", "reporting"]
    
  - name: "End-to-End System"
    tests: ["full_customer_journey", "profit_calculation", "scaling"]
```

## Output File Tree Structure:
```
autonomous-vertex-system/
├── README.md
├── FILE_TREE.md
├── docker-compose.yml
├── .env.example
├── scripts/
│   ├── deploy.sh
│   ├── test.sh
│   └── backup.sh
├── infrastructure/
│   ├── docker/
│   │   ├── postgres-age/Dockerfile
│   │   ├── n8n/Dockerfile
│   │   ├── postal/Dockerfile
│   │   └── [all other services]
│   ├── kubernetes/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── configmaps/
│   │   └── secrets/
│   └── terraform/
├── automation/
│   ├── n8n/
│   │   ├── workflows/
│   │   └── credentials/
│   └── templates/
├── ai/
│   ├── models/
│   ├── prompts/
│   └── training/
├── revenue/
│   ├── funnels/
│   ├── products/
│   └── analytics/
├── monitoring/
│   ├── grafana/dashboards/
│   ├── prometheus/rules/
│   └── alerts/
└── docs/
    ├── setup_guide.md
    ├── architecture.md
    ├── api_reference.md
    └── troubleshooting.md
```

## Success Metrics:
- All 45+ components deployed and integrated
- 100% test coverage with passing tests
- <30 second end-to-end customer journey
- Ready for $100/month deployment
- Projected 6-figure annual revenue capability
```