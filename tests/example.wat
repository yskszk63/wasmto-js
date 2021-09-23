;; example.wat
(module
  (import "env" "import_func" (func (param i32) (result i32)))
  ;; var result = add(a, b)
  (func (export "add") (param $a i32) (param $b i32) (result i32)
    ;; return a + b
    (i32.add
      (get_local $a)
      (get_local $b)
    )
  )
  (memory $mem 1)
  (export "memory" (memory $mem))

  (global (export "global") (mut i32) (i32.const 0))

  (table (export "table") 2 funcref)

  ;; non export
  (func (param i32) (param i32) (param i64) (result i32) (i32.const 1))
  ;; var result = plusone(a)
  (func $fn (export "plusone") (param $a i32) (result i32)
    ;; return a + b
    (i32.add
      (get_local $a)
      (i32.const 1)
    )
  )

  (export "plusone2" (func $fn))
)
