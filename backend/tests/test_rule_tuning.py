import pytest
from app.detector import DetectorConfig
from app.rule_tuning import apply_rule_overrides, validate_rule_overrides
from app.schemas import RuleTuningOverride

def test_validate_rule_overrides_valid():
    overrides = RuleTuningOverride(
        high_frequency_threshold=20,
        path_scanning_404_threshold=10,
        sensitive_paths=["/admin", "/.env"],
        disabled_rules=["high_frequency_ip"]
    )
    warnings = validate_rule_overrides(overrides)
    assert len(warnings) == 0

def test_validate_rule_overrides_invalid_threshold():
    overrides = RuleTuningOverride(high_frequency_threshold=0)
    warnings = validate_rule_overrides(overrides)
    assert len(warnings) == 1
    assert "high_frequency_threshold" in warnings[0]

def test_validate_rule_overrides_invalid_path():
    overrides = RuleTuningOverride(sensitive_paths=["admin"]) # No leading slash
    warnings = validate_rule_overrides(overrides)
    assert len(warnings) == 1
    assert "must start with '/'" in warnings[0]

def test_validate_rule_overrides_unknown_rule():
    overrides = RuleTuningOverride(disabled_rules=["unknown_rule"])
    warnings = validate_rule_overrides(overrides)
    assert len(warnings) == 1
    assert "Unknown rule_id" in warnings[0]

def test_apply_rule_overrides_success():
    config = DetectorConfig(freq_threshold=10, scan_threshold=5)
    overrides = RuleTuningOverride(
        high_frequency_threshold=50,
        path_scanning_404_threshold=25,
        sensitive_paths=["/new-admin"],
        suspicious_user_agents=["bot"],
        disabled_rules=["path_scanning"]
    )

    new_config = apply_rule_overrides(config, overrides)

    assert new_config.freq_threshold == 50
    assert new_config.scan_threshold == 25
    assert "/new-admin" in new_config.sensitive_paths
    assert "bot" in new_config.suspicious_ua_keywords
    assert "path_scanning" in new_config.disabled_rules

    # Original config should not be modified
    assert config.freq_threshold == 10
    assert config.scan_threshold == 5
    assert "path_scanning" not in config.disabled_rules

def test_apply_rule_overrides_partial():
    config = DetectorConfig(freq_threshold=10)
    overrides = RuleTuningOverride(high_frequency_threshold=5)

    new_config = apply_rule_overrides(config, overrides)
    assert new_config.freq_threshold == 5
    # Others should stay same as original
    assert new_config.scan_threshold == config.scan_threshold
    assert new_config.sensitive_paths == config.sensitive_paths
