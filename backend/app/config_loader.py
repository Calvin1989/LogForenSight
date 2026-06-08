import yaml
import os
from typing import Optional
from .detector import DetectorConfig

def load_detector_config(config_path: Optional[str] = None) -> DetectorConfig:
    """
    Loads security detection rules from a YAML file and merges them with defaults.
    
    Args:
        config_path: Path to the YAML configuration file.
        
    Returns:
        A DetectorConfig instance.
        
    Raises:
        ValueError: If YAML format is invalid or data types are incorrect.
    """
    default_config = DetectorConfig()
    
    if config_path is None or not os.path.exists(config_path):
        return default_config
        
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
            
        if data is None:
            return default_config
            
        if not isinstance(data, dict):
            raise ValueError(f"Invalid YAML format in {config_path}: Expected a dictionary.")
            
        # Merge values
        freq_threshold = data.get('high_frequency_threshold', default_config.freq_threshold)
        scan_threshold = data.get('path_scanning_404_threshold', default_config.scan_threshold)
        sensitive_paths = data.get('sensitive_paths', default_config.sensitive_paths)
        suspicious_ua = data.get('suspicious_user_agents', default_config.suspicious_ua_keywords)
        
        # Validation
        if not isinstance(freq_threshold, int):
            raise ValueError(f"Type error: high_frequency_threshold must be an integer, got {type(freq_threshold).__name__}")
        if not isinstance(scan_threshold, int):
            raise ValueError(f"Type error: path_scanning_404_threshold must be an integer, got {type(scan_threshold).__name__}")
        if not isinstance(sensitive_paths, (list, set)):
            raise ValueError(f"Type error: sensitive_paths must be a list or set, got {type(sensitive_paths).__name__}")
        if not isinstance(suspicious_ua, (list, set)):
            raise ValueError(f"Type error: suspicious_user_agents must be a list or set, got {type(suspicious_ua).__name__}")
            
        return DetectorConfig(
            freq_threshold=freq_threshold,
            scan_threshold=scan_threshold,
            sensitive_paths=set(sensitive_paths),
            suspicious_ua_keywords=set(suspicious_ua)
        )
        
    except yaml.YAMLError as e:
        raise ValueError(f"YAML parsing error in {config_path}: {str(e)}")
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Error loading configuration from {config_path}: {str(e)}")
