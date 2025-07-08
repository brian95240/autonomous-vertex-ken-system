#!/usr/bin/env python3
"""
K.E.N. Quintillion System - Database Initialization Script
Version: 2.0.0-quintillion
Enhancement Factor: 1.73 Quintillion x
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('database_init.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class KENDatabaseInitializer:
    """Initialize K.E.N. Quintillion System Database"""
    
    def __init__(self):
        self.connection = None
        self.cursor = None
        
        # Load environment variables
        self.db_host = os.getenv('DATABASE_HOST', 'ep-billowing-grass-aeg3qtoi-pooler.c-2.us-east-2.aws.neon.tech')
        self.db_name = os.getenv('DATABASE_NAME', 'neondb')
        self.db_user = os.getenv('DATABASE_USER', 'neondb_owner')
        self.db_password = os.getenv('DATABASE_PASSWORD', '')
        self.db_port = os.getenv('DATABASE_PORT', '5432')
        
    def connect(self):
        """Connect to Neon PostgreSQL database"""
        try:
            connection_string = f"""
            host={self.db_host}
            port={self.db_port}
            dbname={self.db_name}
            user={self.db_user}
            password={self.db_password}
            sslmode=require
            """
            
            logger.info("🔌 Connecting to Neon database...")
            self.connection = psycopg2.connect(connection_string)
            self.connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            self.cursor = self.connection.cursor()
            
            logger.info("✅ Successfully connected to Neon database")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to database: {e}")
            return False
    
    def execute_schema(self):
        """Execute the K.E.N. database schema"""
        try:
            logger.info("📊 Executing K.E.N. database schema...")
            
            # Read schema file
            schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
            with open(schema_path, 'r') as f:
                schema_sql = f.read()
            
            # Execute schema
            self.cursor.execute(schema_sql)
            
            logger.info("✅ Database schema executed successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to execute schema: {e}")
            return False
    
    def verify_installation(self):
        """Verify the database installation"""
        try:
            logger.info("🔍 Verifying database installation...")
            
            # Check system configuration
            self.cursor.execute("SELECT COUNT(*) FROM ken_system_config")
            config_count = self.cursor.fetchone()[0]
            
            # Check algorithms
            self.cursor.execute("SELECT COUNT(*) FROM ken_algorithms")
            algorithm_count = self.cursor.fetchone()[0]
            
            # Check categories
            self.cursor.execute("SELECT COUNT(*) FROM ken_algorithm_categories")
            category_count = self.cursor.fetchone()[0]
            
            # Check performance metrics
            self.cursor.execute("SELECT COUNT(*) FROM ken_performance_metrics")
            metrics_count = self.cursor.fetchone()[0]
            
            # Check health checks
            self.cursor.execute("SELECT COUNT(*) FROM ken_health_checks")
            health_count = self.cursor.fetchone()[0]
            
            logger.info(f"📈 Verification Results:")
            logger.info(f"   • System Config: {config_count} entries")
            logger.info(f"   • Algorithms: {algorithm_count}/49 algorithms")
            logger.info(f"   • Categories: {category_count}/7 categories")
            logger.info(f"   • Performance Metrics: {metrics_count} entries")
            logger.info(f"   • Health Checks: {health_count} entries")
            
            if algorithm_count == 49 and category_count == 7:
                logger.info("✅ Database verification successful!")
                return True
            else:
                logger.error("❌ Database verification failed - missing data")
                return False
                
        except Exception as e:
            logger.error(f"❌ Verification failed: {e}")
            return False
    
    def get_system_info(self):
        """Get K.E.N. system information"""
        try:
            self.cursor.execute("""
                SELECT 
                    system_name,
                    version,
                    enhancement_factor,
                    algorithm_count,
                    deployment_region,
                    created_at
                FROM ken_system_config 
                LIMIT 1
            """)
            
            result = self.cursor.fetchone()
            if result:
                system_name, version, enhancement_factor, algorithm_count, region, created_at = result
                
                logger.info("🚀 K.E.N. System Information:")
                logger.info(f"   • Name: {system_name}")
                logger.info(f"   • Version: {version}")
                logger.info(f"   • Enhancement Factor: {enhancement_factor:,} x")
                logger.info(f"   • Algorithm Count: {algorithm_count}")
                logger.info(f"   • Region: {region}")
                logger.info(f"   • Initialized: {created_at}")
                
                return True
            else:
                logger.error("❌ No system configuration found")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to get system info: {e}")
            return False
    
    def test_performance(self):
        """Test database performance"""
        try:
            logger.info("⚡ Testing database performance...")
            
            start_time = datetime.now()
            
            # Test query performance
            self.cursor.execute("""
                SELECT 
                    a.name,
                    a.category_name,
                    a.triton_accelerated,
                    c.name as category_description
                FROM ken_algorithms a
                JOIN ken_algorithm_categories c ON a.category_id = c.id
                ORDER BY a.algorithm_id
            """)
            
            results = self.cursor.fetchall()
            end_time = datetime.now()
            
            query_time = (end_time - start_time).total_seconds() * 1000
            
            logger.info(f"📊 Performance Test Results:")
            logger.info(f"   • Query Time: {query_time:.2f}ms")
            logger.info(f"   • Records Retrieved: {len(results)}")
            logger.info(f"   • Performance: {'✅ Excellent' if query_time < 100 else '⚠️ Acceptable' if query_time < 500 else '❌ Slow'}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Performance test failed: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logger.info("🔌 Database connection closed")

def main():
    """Main initialization function"""
    logger.info("🚀 Starting K.E.N. Quintillion System Database Initialization")
    logger.info("=" * 60)
    
    initializer = KENDatabaseInitializer()
    
    try:
        # Connect to database
        if not initializer.connect():
            sys.exit(1)
        
        # Execute schema
        if not initializer.execute_schema():
            sys.exit(1)
        
        # Verify installation
        if not initializer.verify_installation():
            sys.exit(1)
        
        # Get system information
        if not initializer.get_system_info():
            sys.exit(1)
        
        # Test performance
        if not initializer.test_performance():
            sys.exit(1)
        
        logger.info("=" * 60)
        logger.info("🎉 K.E.N. Quintillion System Database Successfully Initialized!")
        logger.info("🔥 Enhancement Factor: 1.73 QUINTILLION x")
        logger.info("⚡ 49 Algorithm Engine: READY")
        logger.info("🎯 Cost Target: €23.46/month")
        logger.info("=" * 60)
        
    except KeyboardInterrupt:
        logger.info("⚠️ Initialization interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)
    finally:
        initializer.close()

if __name__ == "__main__":
    main()

