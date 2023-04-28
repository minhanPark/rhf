# 리액트 훅 폼

## DevTools

리액트 훅 폼은 데브 툴을 가지고 있어서 form의 value, touched된 상태, dirty된 상태 등을 알 수 있다.

```cmd
npm install -D @hookform/devtools
```

위의 명령어로 DevTools를 설치하자.

```ts
import { DevTool } from "@hookform/devtools";

export default () => {
  const { register, control } = useForm();

  return (
    <>
      (...폼이 그려져 있음)
      <DevTool control={control} /> {/* set up the dev tool */}
    </>
  );
};
```

위와 같이 control을 전달해주면 해당 폼에 대해서 devtool이 실행된다.

## Form State와 리 렌더링

폼의 상태가 변할 때 rhf은 리렌더링을 할까? 정답은 **아니다** 이다.

```ts
let renderCount = 0;

export const YouTubeForm = () => {
  const form = useForm();
  const { register } = form;
  const { va } = register("id");

  renderCount++;
  return (
    <div>
      <h1>Youtube form ({renderCount / 2})</h1>
      <form>
        <label htmlFor="username">Username</label>
        <input type="text" id="username" {...register("username")} />
        <button>Submit</button>
      </form>
    </div>
  );
};
```

위와 같은 예시 코드가 있을 때 인풋창에 username을 적어도 renderCount는 계속 1이 되는 것을 알 수 있다.  
생각해보니 register가 리턴하는 값들에도 value는 없고, (name, onBlur, onChange, ref)만 있다. 일부러 value가 바뀔 시 리렌더링이 되지 않도록 value만 따로 조절하는 듯 하다.

## FormValidation

훅폼의 validation을 테스트하기 위해서 일단은 form 태그에 noValidate 속성을 주자.  
해당 속성을 주면 html validation이 작동하지 않는다.

```ts
<input
  type="text"
  id="username"
  {...register("username", { required: "USername is required" })}
/>
```

기본적으로 저렇게 객체를 주고, required, pattern 등을 통해서 validation이 가능하다.

```ts
const { formState } = form;
const { errors } = formState;
```

formState안에 errors 객체가 있는데 해당 객체 안에 에러들이 같이 담겨있다.

```js
<p className="error">{errors.username?.message}</p>
```

위와같이 에러 메시지 등에 접근이 가능하다.

> 모드에 따라서 언제 form의 validation을 할 지 정해지는데 기본값이 onSubmit이기 때문에 폼을 제출 할 때 error가 생긴다.

## DefaultValue

기본적으로 input의 value는 defaultValue로 설정이 가능하다.

```ts
const form = useForm<FormValues>({
  defaultValues: {
    username: "",
    email: "",
    channel: "",
  },
});
```

위와 같이 default value를 줄 수 있고, 강의 예시에서는 async 함수를 넣어서 비동기식으로도 기본값을 넣어준다.

기본값이 왜 중요하냐면 **값은 넣은 상태로 Touched와 Dirty 상태를 false로 만들 수 있다**.  
input중에 무엇하나라도 값이 달라진다면(제공되는 기본값과 다르다면) dirty가 true가 된다.

```ts
const { register, control, handleSubmit, formState, reset } = form;
const { errors, isDirty } = formState;

<button disabled={!isDirty}>Submit</button>;
```

위의 isDirty 상태로 버튼을 활성화/비활성화 시킬 수 있음.

> 리셋에서도 디폴트 값을 전달할 수 있는데 그러면 디폴트 값을 넣은 채 상태(Touched, Dirty)가 다 false가 되서 사용자 정보 변경 등에 사용하기 좋음. 만약 리셋 때 디폴트 값을 넣지 않으면 폼을 맨 처음 형성할 때 썼던 디폴트 값으로 전달됨

## 중첩 객체 및 배열과 register 연결하기

기본적으로 form value는 객체랑 연결될 것이다.  
중첩된 객체 및 배열과는 어떻게 연결할까 ?

```ts
type FormValues = {
  social: {
    twitter: string;
    facebook: string;
  };
  phoneNumbers: string[];
};

const form = useForm<FormValues>({
  defaultValues: {
    social: {
      twitter: "",
      facebook: "",
    },
    phoneNumbers: ["", ""],
  },
});
```

위와 같은 타입이 있고, 기본값으로 social 객체와 phoneNumbers 배열을 전달했다.

```ts
<>
  <label htmlFor="facebook">Facebook</label>
  <input type="text" id="facebook" {...register("social.facebook")} />

  <div className="form-control">
    <label htmlFor="primary-phone">Primary phone number</label>
    <input type="text" id="primary-phone" {...register("phoneNumbers.0")} />
  </div>
</>
```

위의 형태처럼 register를 등록해주면 된다. \[\]을 사용하지 말고 . 으로 연결시켜야 한다.

## 동적으로 field 추가하기

폼에 계속해서 정보가 추가된다든 지 할 때 사용하면 유용하다.  
예를 들어 담당자를 계속 추가해야하는 상황 등에서 사용하면 될듯하다.

```ts
import { useForm, useFieldArray } from "react-hook-form";

type FormValues = {
  phNumbers: {
    number: string;
  }[];
};
```

사용할 useForm과 useFieldArray를 불러오고, 폼의 타입을 위와 같이 설정한다.(phNumbers는 number key값을 가지고 있는 배열이다.)

```ts
const form = useForm<FormValues>({
  defaultValues: {
    phNumbers: [{ number: "" }],
  },
});

const { register, control } = form;
```

이렇게 defaultValues를 설정해줬다.

그리고 **나머지 컨트롤을 useFieldArray을 통해서** 하면된다.

```ts
const { fields, append, remove } = useFieldArray({
  name: "phNumbers",
  control,
});
```

우선 배열을 그리는 것부터 fields를 map해서 그린다.

```ts
<div>
  <label>List of phone numbers</label>
  <div>
    {fields.map((field, index) => (
      <div className="form-control" key={field.id}>
        <input type="text" {...register(`phNumbers.${index}.number`)} />
        {index > 0 && (
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        )}
      </div>
    ))}
    <button type="button" onClick={() => append({ number: "" })}>
      Add phone number
    </button>
  </div>
</div>
```

> id 부분이 헷갈릴 수 있는데 fields를 찍어보면 훅폼에서 자동적으로 겹치치 않게 id를 만들어 준다. 그래서 map을 사용할 때 key 값으로 id를 사용한다.

> 리스트에 더하거나 뺄 때는 useFieldArray에서 append나 remove를 가지고 와서 사용한다.

## watch

watch를 사용하면 값을 실시간으로 확인하고, 리렌더링을 일으킬 수도 있다.

```
watch("username");
string | Watch input value by name (similar to lodash get function)

watch(["username", "email"]);
string[] |	Watch multiple inputs

watch()
undefined |	Watch all inputs;

watch
(data: unknown, { name: string, type: string }) => void	| Watch all inputs and invoke a callback
```

중요한건 useEffect에서 watch를 사용하고 인수로 함수를 전달하면 리렌더링이 일어나지 않고 사이드 이펙트를 일으킬 수 있다.

```ts
useEffect(() => {
  const subscription = watch((value, { name, type }) =>
    console.log(value, name, type)
  );
  return () => subscription.unsubscribe();
}, [watch]);
```

콘솔에 값은 {username: 'r', email: ''} 'username' 'change' 로 오는데 value에는 전체값, name에는 어디서 변경되었는 지(인풋 네임), type 변경 타입이 들어오는 것 같다.

> useEffect에서 사용했으면 클린업 함수를 꼭 넣어주자

## serValue

값을 바꿀 때 사용하는 것이 setValue이다.

> 기본적으로 값을 바꾸더라고 상태값이 바뀌진 않아서 해당 부분이 대한 검증이 들어가야할 때는 옵션을 줘야한다.

```ts
setValue("username", "bill", {
  shouldValidate: true,
  shouldDirty: true,
  shouldTouch: true,
});
```

## disabled 처리

rhf에서도 disabled 처리를 할 수 있다.

```ts
<input
  type="text"
  id="twitter"
  {...register("social.twitter", {
    required: "Enter",
    disabled: true,
  })}
/>
```

그냥 input에 넣는거랑 무슨 차이일까?  
만약 개발자 도구를 열고 해당 인풋창에 disabled 속성을 지운다음에 글을 쓰고 제출해도 해당 값은 undefined로 올 것이다. 인풋창에 바로 넣었다면 값이 변해서 갔을거지만..

```ts
watch("channel") === "" 같은 watch 조건식을 disabled에 전달해주면 조건에 따라 disabled를 사용할 수 있다.
```

## submission 에러 다루기

handleSubmit에는 두가지 함수가 들어가는데 하나는 onSubmit, 하나는 onError이다.
submission에 실패했을 때 onError가 실행된다.

```ts
import { useForm, useFieldArray, FieldErrors } from "react-hook-form";

const onError = (errors: FieldErrors<FormValues>) => {
  console.log("Form errors", errors);
};

<form onSubmit={handleSubmit(onSubmit, onError)}></form>;
```

리액트 훔폼에서 FieldErrors를 갖고와서 제너릭으로 FormValues(폼 기본 타입)를 전달해주면 된다.

## mode

rhf은 기본적으로 제출을 했을 때 validation이 실행된다. 기본옵션인 onSubmit으로 되어 있어서인데 이걸 다른 것들로 바꿀 수 있다.

```ts
export type Mode = {
  onBlur: "onBlur";
  onChange: "onChange";
  onSubmit: "onSubmit";
  onTouched: "onTouched";
  all: "all";
};
```

onBlur는 인풋창에서 포커스가 들어갔다가 빠져나갈 때 validation을 실행한다.

> mode를 바꾼 순간 폼이 validation을 할 때마다 리렌더링 된다.

onTouched는 인풋에서 작동할 때 validation을 판단한다.  
onChange는 모든 change 이벤트에 대해서 반응한다
all은 onBlur와 onChange까지 합친 것이다.

확실히 mode에 따라서 리렌더링이 많이 일어나는 것 같다.

## trigger

수동적으로 인풋 및 폼의 validation을 발생시킬 수 있다.

```ts
trigger(); //폼의 validation
trigger("username"); //인풋의 validation
```
