import pytest
import os
import yaml
from app.config_loader import load_detector_config
from app.detector import DetectorConfig

def test_load_default_config():
    # When config_path is None or doesn't exist
    config = load_detector_config(None)
    assert isinstance(config, DetectorConfig)
    assert config.freq_threshold == 10
    
    config = load_detector_config("non_existent.yaml")
    assert config.freq_threshold == 10

def test_load_valid_yaml(tmp_path):
    d = tmp_path / "config"
    d.mkdir()
    config_file = d / "rules.yaml"
    
    config_data = {
        "high_frequency_threshold": 50,
        "path_scanning_404_threshold": 20,
        "sensitive_paths": ["/secret", "/private"],
        "suspicious_user_agents": ["hacker-bot"]
    }
    
    with open(config_file, "w") as f:
        yaml.dump(config_data, f)
        
    config = load_detector_config(str(config_file))
    assert config.freq_threshold == 50
    assert config.scan_threshold == 20
    assert "/secret" in config.sensitive_paths
    assert "hacker-bot" in config.suspicious_ua_keywords
    assert len(config.sensitive_paths) == 2

def test_load_partial_yaml(tmp_path):
    config_file = tmp_path / "partial.yaml"
    
    # Only override one field
    config_data = {
        "high_frequency_threshold": 100
    }
    
    with open(config_file, "w") as f:
        yaml.dump(config_data, f)
        
    config = load_detector_config(str(config_file))
    assert config.freq_threshold == 100
    # Other fields should use defaults
    assert config.scan_threshold == 5
    assert "/.env" in config.sensitive_paths

def test_invalid_yaml_format(tmp_path):
    config_file = tmp_path / "invalid.yaml"
    with open(config_file, "w") as f:
        f.write("not a dictionary")
        
    with pytest.raises(ValueError, match="Expected a dictionary"):
        load_detector_config(str(config_file))

def test_invalid_type_threshold(tmp_path):
    config_file = tmp_path / "type_error.yaml"
    config_data = {
        "high_frequency_threshold": "not an int"
    }
    with open(config_file, "w") as f:
        yaml.dump(config_data, f)
        
    with pytest.raises(ValueError, match="must be an integer"):
        load_detector_config(str(config_file))

def test_invalid_type_paths(tmp_path):
    config_file = tmp_path / "type_error_paths.yaml"
    config_data = {
        "sensitive_paths": "not a list"
    }
    with open(config_file, "w") as f:
        yaml.dump(config_data, f)
        
    with pytest.raises(ValueError, match="must be a list or set"):
        load_detector_config(str(config_file))
